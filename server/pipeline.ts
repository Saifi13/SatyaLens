import type {
  Confidence,
  EvidenceItem,
  EvidenceRelation,
  SourceCategory,
  SourceRef,
  StageId,
  StageStatus,
  SubClaim,
  Verdict,
  VerificationReport,
  VerifyEvent,
} from "../src/types";
import { chatJSON, LlmError } from "./llm";
import { webSearch, SearchError, type SearchResult } from "./search";
import { readPage } from "./pagefetch";
import { PLANNER_SYSTEM, SYNTHESIS_SYSTEM } from "./prompts";

export class PipelineError extends Error {
  constructor(
    message: string,
    readonly code = "PIPELINE_FAILED"
  ) {
    super(message);
  }
}

const RESEARCH_HOSTS = [
  "who.int",
  "un.org",
  "unesco.org",
  "worldbank.org",
  "oecd.org",
  "imf.org",
  "ourworldindata.org",
  "nasa.gov",
  "cdc.gov",
  "nih.gov",
  "pubmed.ncbi.nlm.nih.gov",
  "nature.com",
  "sciencedirect.com",
  "elsevier.com",
  "sdgs.un.org",
];
const FACT_CHECK_HOSTS = [
  "pib.gov.in",
  "altnews.in",
  "boomlive.in",
  "factcheck.org",
  "fullfact.org",
  "snopes.com",
  "chequp.in",
  "factly.in",
  "factchecking.gci.ca",
  "politifact.com",
];
const REFERENCE_HOSTS = [
  "wikipedia.org",
  "britannica.com",
  "worldhistory.org",
  "encyclopedia.com",
];
const NEWS_HOSTS = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "theguardian.com",
  "thehindu.com",
  "indianexpress.com",
  "timesofindia.indiatimes.com",
  "ndtv.com",
  "aljazeera.com",
  "bloomberg.com",
  "ft.com",
  "economist.com",
  "timesofindia.com",
];
const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "pinterest.com",
  "quora.com",
];

const MAX_QUERIES = 3;
const MAX_SOURCES = 6;
const MAX_PER_PUBLISHER = 2;
const PAGE_CONCURRENCY = 6;
const PAGE_BODY_CHARS = 900;

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function baseDomain(host: string): string {
  const parts = host.split(".");
  if (
    parts.length > 2 &&
    /^(co|com|gov|ac|edu|org|net|in|uk|au|br)$/.test(parts[parts.length - 2])
  ) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}

function matchesAny(host: string, list: string[]): boolean {
  return list.some((d) => host === d || host.endsWith("." + d) || host === baseDomain(d));
}

function categorize(url: string): SourceCategory {
  const host = hostnameOf(url);
  const path = url.toLowerCase();
  if (/\.gov(\.[a-z]{2})?$/.test(host) || host.endsWith(".nic.in") || host.endsWith(".gov.uk")) {
    return "government";
  }
  if (host.endsWith(".int") || host.endsWith(".edu") || /\.(ac)\.[a-z]{2}$/.test(host)) {
    return "research";
  }
  if (matchesAny(host, RESEARCH_HOSTS)) {
    return /who|un\.org|unesc|worldbank|oecd|imf|sdgs/.test(host) ? "government" : "research";
  }
  if (matchesAny(host, FACT_CHECK_HOSTS)) return "factcheck";
  if (matchesAny(host, REFERENCE_HOSTS)) return "reference";
  if (host === "reuters.com" && /fact.?check/.test(path)) return "factcheck";
  if (matchesAny(host, NEWS_HOSTS)) return "news";
  if (/(fact.?check|misinformation|mythbuster)/.test(path)) return "factcheck";
  return "other";
}

const CATEGORY_RANK: Record<SourceCategory, number> = {
  government: 0,
  research: 0,
  factcheck: 1,
  reference: 2,
  news: 3,
  other: 4,
};

function toRef(url: string, title: string, publishedAt?: string, id?: string): SourceRef {
  const host = hostnameOf(url);
  const now = new Date().toISOString();
  return {
    id: id ?? `s-${Math.random().toString(36).slice(2, 8)}`,
    url,
    domain: host,
    publisher: host,
    title: cleanTitle(title, host),
    publishedAt: normalizeDate(publishedAt),
    category: categorize(url),
    accessed: false,
    discoveredAt: now,
    accessStatus: "found",
  };
}

function cleanTitle(title: string, host: string): string {
  const t = (title ?? "").replace(/\s+/g, " ").trim();
  if (!t) return host;
  return t.length > 170 ? t.slice(0, 167) + "…" : t;
}

function normalizeDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  const iso = d.toISOString().slice(0, 10);
  return iso > "2100-01-01" || iso < "1500-01-01" ? undefined : iso;
}

function urlKey(url: string): string | null {
  try {
    const u = new URL(url);
    return (
      u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/+$/, "")
    ).toLowerCase();
  } catch {
    return null;
  }
}

function pickQueries(subClaims: { queries: string[] }[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const maxRound = 3;
  for (let r = 0; r < maxRound && out.length < MAX_QUERIES; r++) {
    for (const s of subClaims) {
      const q = (s.queries[r] ?? "").trim();
      const n = q.toLowerCase().replace(/\s+/g, " ");
      if (n.length < 8 || seen.has(n)) continue;
      seen.add(n);
      out.push(q);
      if (out.length >= MAX_QUERIES) break;
    }
  }
  return out;
}

async function mapAll<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

const VALID_VERDICTS: Verdict[] = [
  "SUPPORTED",
  "CONTRADICTED",
  "INSUFFICIENT_EVIDENCE",
];
const VALID_RELATIONS: EvidenceRelation[] = ["supports", "contradicts", "context"];

function asVerdict(v: unknown): Verdict {
  return VALID_VERDICTS.includes(v as Verdict) ? (v as Verdict) : "INSUFFICIENT_EVIDENCE";
}

function asConfidence(c: unknown): Confidence {
  return c === "high" || c === "medium" || c === "low" ? c : "low";
}

interface PlannerResponse {
  verifiable: string;
  restatement: string;
  subjectivity_note: string;
  context_gaps: string[];
  sub_claims: { text: string; queries: string[] }[];
}

interface SynthesisResponse {
  assessments: {
    sub_claim_index: number;
    findings: { source_id: string; relation: string; excerpt: string; why: string }[];
  }[];
  verdict: string;
  confidence: string;
  confidence_note: string;
  summary: string;
  sub_claim_verdicts: {
    sub_claim_index: number;
    verdict: string;
    explanation: string;
  }[];
  assessment: {
    established: string[];
    disputed: string[];
    uncertain: string[];
    rationale: string;
  };
  limitations: string;
}

type Emit = (event: VerifyEvent) => void;

function nowIso(): string {
  return new Date().toISOString();
}

export async function* runVerification(
  claim: string
): AsyncGenerator<VerifyEvent> {
  const queue: VerifyEvent[] = [];
  const signal: { wake: (() => void) | null } = { wake: null };
  let finished = false;
  let thrown: unknown;

  const emit: Emit = (event) => {
    queue.push(event);
    signal.wake?.();
  };

  const work = (async () => {
    try {
      await execute(claim, emit);
    } catch (err) {
      thrown = err;
    } finally {
      finished = true;
      signal.wake?.();
    }
  })();

  while (!finished || queue.length) {
    if (queue.length) {
      yield queue.shift()!;
      continue;
    }
    await new Promise<void>((resolve) => {
      signal.wake = resolve;
    });
  }
  await work;
  if (thrown) throw thrown;
}

async function execute(claim: string, emit: Emit): Promise<void> {
  const timings: Record<string, number> = {};
  const started = Date.now();
  let activitySeq = 0;

  const stage = (id: StageId, status: StageStatus, detail?: string) => {
    emit({ type: "stage", data: { stage: id, status, detail } });
  };
  const activity = (message: string, stageId?: StageId) => {
    emit({
      type: "activity",
      data: {
        id: `a${++activitySeq}`,
        at: nowIso(),
        message,
        stage: stageId,
      },
    });
  };
  const mark = (name: string, ms: number) => {
    timings[name] = ms;
    console.log(`[satyalens] ${name} ${ms}ms`);
  };

  const pageTexts = new Map<string, string>();

  stage("understand", "running");
  stage("extract", "running");
  let planner: PlannerResponse;
  const analyzeStart = Date.now();
  try {
    planner = await chatJSON<PlannerResponse>(PLANNER_SYSTEM, claim, {
      maxTokens: 800,
    });
  } catch (err) {
    stage("understand", "failed", "Claim analysis did not complete");
    stage("extract", "failed");
    throw failure(
      err,
      "The claim-analysis step failed. Verify the AI provider is configured and reachable."
    );
  }
  mark("claimAnalysis", Date.now() - analyzeStart);
  activity("Claim successfully analyzed.", "understand");
  stage(
    "understand",
    "done",
    planner.restatement?.trim() || "Statement understood"
  );

  const subClaims = (planner.sub_claims ?? [])
    .filter((s) => typeof s.text === "string" && s.text.trim().length > 12)
    .slice(0, 3)
    .map((s) => ({
      text: s.text.trim(),
      queries: (s.queries ?? [])
        .filter((q) => typeof q === "string" && q.trim())
        .slice(0, 2),
    }));
  stage(
    "extract",
    "done",
    subClaims.length
      ? `${subClaims.length} verifiable ${subClaims.length === 1 ? "statement" : "statements"} extracted`
      : "No atomic factual statements were found"
  );

  const researchable =
    ["yes", "partial"].includes(planner.verifiable) && subClaims.length > 0;

  if (!researchable) {
    stage("search", "done", "Skipped — nothing checkable to research");
    stage("read", "done", "Skipped");
    stage("evaluate", "done", "Skipped");
    stage("compare", "done", "Skipped");
    stage("report", "running");
    const report: VerificationReport = {
      claim,
      verdict: "INSUFFICIENT_EVIDENCE",
      confidence: "high",
      confidenceNote:
        "This rating reflects the classification step, not a judgment about truth.",
      summary:
        planner.verifiable === "no"
          ? `SatyaLens could not find an atomic factual assertion to verify. ${planner.subjectivity_note || "The statement appears to be opinion, rhetoric, or too vague to test against evidence."}`
          : "The statement is only partly verifiable and no concrete factual claims could be extracted from it.",
      verifiedAt: nowIso(),
      subClaims: subClaims.map((s) => ({
        text: s.text,
        kind: "ambiguous" as const,
        verdict: null,
        explanation: "No search was run because no checkable assertion was isolated.",
        evidence: [],
        sourceIds: [],
      })),
      sources: [],
      evidence: [],
      assessment: {
        established: [],
        disputed: [],
        uncertain: [planner.restatement?.trim() || claim],
        rationale:
          "Verification requires a specific, checkable factual assertion. Opinion, belief-framed predictions, or ambiguous wording cannot be settled with evidence.",
      },
      limitations:
        "Rephrase the statement as a concrete factual claim — with dates, places and numbers — and SatyaLens can research it.",
      searchQueries: [],
      independentSourceCount: 0,
    };
    stage("report", "done", "Report ready");
    mark("total", Date.now() - started);
    console.log(`[satyalens] timings ${JSON.stringify(timings)}`);
    emit({ type: "report", data: report });
    return;
  }

  stage("search", "running");
  const queries = pickQueries(subClaims);
  const seen = new Set<string>();
  const publisherCount = new Map<string, number>();
  const candidates: { ref: SourceRef; snippet: string }[] = [];

  const searchStart = Date.now();
  await Promise.all(
    queries.map(async (q) => {
      let results: SearchResult[] = [];
      try {
        results = await webSearch(q);
      } catch (err) {
        if (err instanceof SearchError) {
          activity(`Search query failed (${err.message}).`, "search");
          return;
        }
        throw err;
      }
      activity(`Search query executed: “${q}”.`, "search");
      const newly: { ref: SourceRef; snippet: string }[] = [];
      for (const r of results) {
        if (candidates.length >= 8) break;
        const key = urlKey(r.url);
        if (!key || seen.has(key)) continue;
        const host = hostnameOf(r.url);
        if (matchesAny(host, SOCIAL_HOSTS)) continue;
        const pub = baseDomain(host);
        if ((publisherCount.get(pub) ?? 0) >= MAX_PER_PUBLISHER) continue;
        seen.add(key);
        publisherCount.set(pub, (publisherCount.get(pub) ?? 0) + 1);
        const ref = toRef(r.url, r.title, r.publishedAt, `s${candidates.length + 1}`);
        const snippet = (r.snippet ?? "").trim();
        ref.snippet = snippet ? snippet.slice(0, 420) : undefined;
        const item = { ref, snippet };
        candidates.push(item);
        newly.push(item);
      }
      if (newly.length) {
        activity(
          `${newly.length} ${newly.length === 1 ? "source" : "sources"} discovered.`,
          "search"
        );
        for (const c of newly) {
          emit({
            type: "source",
            data: {
              phase: "found",
              source: c.ref,
              count: candidates.length,
              snippet: c.ref.snippet,
            },
          });
        }
      }
    })
  );
  mark("search", Date.now() - searchStart);

  if (candidates.length === 0) {
    stage("search", "failed", "No usable search results");
    throw new PipelineError(
      "The search provider returned no usable results, so verification cannot proceed without evidence.",
      "NO_RESULTS"
    );
  }

  candidates.sort(
    (a, b) => CATEGORY_RANK[a.ref.category] - CATEGORY_RANK[b.ref.category]
  );
  const selected = candidates.slice(0, MAX_SOURCES);
  for (const c of selected) {
    emit({
      type: "source",
      data: {
        phase: "found",
        source: c.ref,
        count: selected.length,
        snippet: c.ref.snippet,
      },
    });
  }
  stage("search", "done", `${selected.length} distinct sources retrieved`);

  stage("read", "running");
  const readStart = Date.now();
  await mapAll(selected, PAGE_CONCURRENCY, async (c) => {
    emit({ type: "source", data: { phase: "reading", source: { ...c.ref, accessStatus: "reading" } } });
    const page = await readPage(c.ref.url);
    const retrievedAt = nowIso();
    if (page.ok) {
      c.ref.accessed = true;
      c.ref.accessStatus = "opened";
      c.ref.retrievedAt = retrievedAt;
      pageTexts.set(c.ref.id, page.text);
      emit({
        type: "source",
        data: {
          phase: "read",
          source: { ...c.ref },
          retrievedAt,
        },
      });
      activity(`Article successfully retrieved: ${c.ref.domain}.`, "read");
    } else {
      const hasSnippet = Boolean(c.snippet);
      c.ref.accessed = false;
      c.ref.accessStatus = hasSnippet ? "snippet" : "failed";
      c.ref.failReason = page.reason;
      c.ref.retrievedAt = retrievedAt;
      emit({
        type: "source",
        data: {
          phase: "failed",
          source: { ...c.ref },
          failReason: page.reason,
          retrievedAt,
          snippet: c.ref.snippet,
        },
      });
      if (hasSnippet) {
        activity(
          `Source extraction failed for ${c.ref.domain} (${page.reason ?? "unavailable"}). Using the search snippet.`,
          "read"
        );
      } else {
        activity(
          `Source extraction failed: ${c.ref.domain} (${page.reason ?? "unavailable"}).`,
          "read"
        );
      }
    }
  });
  mark("pageRetrieval", Date.now() - readStart);
  stage(
    "read",
    "done",
    `${pageTexts.size}/${selected.length} pages fully readable; the rest rely on search snippets only`
  );

  stage("evaluate", "running");
  activity("Evidence comparison started.", "evaluate");
  stage("compare", "running");
  activity("Final synthesis started.", "compare");

  const dossier = selected
    .map((c) => {
      const full = pageTexts.get(c.ref.id);
      const body = (full ?? c.snippet)
        .slice(0, PAGE_BODY_CHARS)
        .replace(/<\/?retrieved_data>/gi, "");
      const origin = full ? "full page retrieved" : "search snippet only";
      return [
        `### SOURCE ${c.ref.id} | ${c.ref.domain} | category=${c.ref.category} | ${origin}`,
        `TITLE: ${c.ref.title}`,
        `URL: ${c.ref.url}`,
        `MATERIAL:`,
        `<retrieved_data>`,
        body,
        `</retrieved_data>`,
      ].join("\n");
    })
    .join("\n\n");
  const subClaimList = subClaims.map((s, i) => `${i}: ${s.text}`).join("\n");

  const evalStart = Date.now();
  let synthesis: SynthesisResponse;
  try {
    synthesis = await chatJSON<SynthesisResponse>(
      SYNTHESIS_SYSTEM,
      `SUB-CLAIMS:\n${subClaimList}\n\nORIGINAL STATEMENT:\n${claim}\n\nIndependent publishers in this set: ${[
        ...new Set(selected.map((c) => baseDomain(c.ref.domain))),
      ].join(", ")}\n\nRETRIEVED SOURCES:\n\n${dossier}`,
      { maxTokens: 1800 }
    );
  } catch (err) {
    stage("evaluate", "failed", "Evidence evaluation did not complete");
    stage("compare", "failed");
    throw failure(err, "Evidence evaluation failed.");
  }
  const synthesisMs = Date.now() - evalStart;
  mark("evidenceEvaluation", synthesisMs);
  mark("finalSynthesis", synthesisMs);

  const validIds = new Set(selected.map((c) => c.ref.id));
  const findingsBySub = new Map<number, EvidenceItem[]>();
  for (const a of synthesis.assessments ?? []) {
    const idx = Number(a.sub_claim_index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= subClaims.length) continue;
    const items: EvidenceItem[] = [];
    for (const f of a.findings ?? []) {
      if (!validIds.has(f.source_id)) continue;
      if (!VALID_RELATIONS.includes(f.relation as EvidenceRelation)) continue;
      items.push({
        sourceId: f.source_id,
        relation: f.relation as EvidenceRelation,
        excerpt: String(f.excerpt ?? "").slice(0, 420),
        why: String(f.why ?? "").slice(0, 420),
        independentlySourced: true,
      });
    }
    findingsBySub.set(idx, items);
  }
  const totalFindings = [...findingsBySub.values()].reduce(
    (n, v) => n + v.length,
    0
  );

  const relationBySource = new Map<string, EvidenceRelation>();
  const rank: Record<EvidenceRelation, number> = {
    contradicts: 3,
    supports: 2,
    context: 1,
  };
  findingsBySub.forEach((items) => {
    for (const item of items) {
      const prev = relationBySource.get(item.sourceId);
      if (!prev || rank[item.relation] > rank[prev]) {
        relationBySource.set(item.sourceId, item.relation);
      }
    }
  });
  for (const c of selected) {
    const relation = relationBySource.get(c.ref.id);
    if (relation) {
      emit({
        type: "source",
        data: { phase: "evaluated", source: c.ref, relation },
      });
    }
  }

  stage(
    "evaluate",
    "done",
    totalFindings
      ? `${totalFindings} relevant ${totalFindings === 1 ? "finding" : "findings"} across ${selected.length} sources`
      : "No retrieved source materially addresses this claim"
  );

  const evidenceIds = new Set<string>();
  findingsBySub.forEach((v) => v.forEach((e) => evidenceIds.add(e.sourceId)));
  const independentDomains = new Set(
    selected
      .filter((c) => evidenceIds.has(c.ref.id))
      .map((c) => baseDomain(c.ref.domain))
  );

  stage(
    "compare",
    "done",
    `${asVerdict(synthesis.verdict)} · ${independentDomains.size} independent ${independentDomains.size === 1 ? "publisher" : "publishers"} carry relevant evidence`
  );

  stage("report", "running");
  const builtSubClaims: SubClaim[] = subClaims.map((s, i) => {
    const sv = (synthesis.sub_claim_verdicts ?? []).find(
      (x) => Number(x.sub_claim_index) === i
    );
    const ev = findingsBySub.get(i) ?? [];
    return {
      text: s.text,
      kind: "factual",
      verdict: sv ? asVerdict(sv.verdict) : "INSUFFICIENT_EVIDENCE",
      explanation:
        typeof sv?.explanation === "string" && sv.explanation.trim()
          ? sv.explanation.trim()
          : "No per-statement explanation was provided; see the overall assessment.",
      evidence: ev,
      sourceIds: [...new Set(ev.map((e) => e.sourceId))],
    };
  });

  const report: VerificationReport = {
    claim,
    verdict: asVerdict(synthesis.verdict),
    confidence: asConfidence(synthesis.confidence),
    confidenceNote:
      String(synthesis.confidence_note ?? "").trim() ||
      "Confidence reflects the quality and independence of the retrieved evidence.",
    summary:
      String(synthesis.summary ?? "").trim() ||
      "The verdict engine returned no summary.",
    verifiedAt: nowIso(),
    subClaims: builtSubClaims,
    sources: selected.map((c) => c.ref),
    evidence: [...findingsBySub.values()].flat(),
    assessment: {
      established: (synthesis.assessment?.established ?? []).map(String),
      disputed: (synthesis.assessment?.disputed ?? []).map(String),
      uncertain: (synthesis.assessment?.uncertain ?? []).map(String),
      rationale:
        String(synthesis.assessment?.rationale ?? "").trim() ||
        "See the evidence above.",
    },
    limitations:
      String(synthesis.limitations ?? "").trim() ||
      "Some sources were only available as search snippets; open the original links to confirm context.",
    searchQueries: queries,
    independentSourceCount: independentDomains.size,
  };
  stage("report", "done", "Report ready");
  mark("total", Date.now() - started);
  console.log(`[satyalens] timings ${JSON.stringify(timings)}`);
  emit({ type: "report", data: report });
}

function failure(err: unknown, fallback: string): PipelineError {
  if (err instanceof PipelineError) return err;
  if (err instanceof LlmError)
    return new PipelineError(`${fallback} (${err.message})`, "AI_FAILED");
  if (err instanceof SearchError) return new PipelineError(fallback, "SEARCH_FAILED");
  return new PipelineError(fallback, "PIPELINE_FAILED");
}
