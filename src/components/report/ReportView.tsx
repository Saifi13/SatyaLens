import { motion } from "framer-motion";
import {
  Check,
  Copy,
  FileQuestion,
  Link2,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { SourceRef, VerificationReport } from "../../types";
import { formatDateTime, copyText } from "../../lib/format";
import { reportToMarkdown } from "../../lib/api";
import { VerdictBadge, ConfidenceMeter } from "../Verdict";
import { EvidenceCard, SourceCard, SubClaimDisclosure } from "./parts";

const stagger = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

function CopyButton({
  getText,
  label,
  toast,
}: {
  getText: () => string;
  label: string;
  toast: (ok: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const ok = await copyText(getText());
        toast(ok);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }
      }}
      className="btn-ghost text-[13px] px-3.5 py-2"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-verdict-green" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Link2; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-eyebrow text-ink-500">
      <Icon className="h-4 w-4 text-accent-500" strokeWidth={1.9} />
      {children}
    </h3>
  );
}

export default function ReportView({
  report,
  elapsedSeconds,
  onToast,
}: {
  report: VerificationReport;
  elapsedSeconds?: number;
  onToast: (tone: "success" | "error", msg: string) => void;
}) {
  const sources = new Map<string, SourceRef>(
    report.sources.map((s) => [s.id, s])
  );
  const supporting = report.evidence.filter((e) => e.relation === "supports");
  const contradicting = report.evidence.filter((e) => e.relation === "contradicts");
  const contextual = report.evidence.filter((e) => e.relation === "context");

  const groups: {
    key: string;
    title: string;
    items: typeof report.evidence;
    empty: string;
  }[] = [
    {
      key: "supports",
      title: "Supporting evidence",
      items: supporting,
      empty: "No retrieved source was found that directly supports the claim.",
    },
    {
      key: "contradicts",
      title: "Contradicting evidence",
      items: contradicting,
      empty: "No retrieved source was found that directly contradicts the claim.",
    },
    {
      key: "context",
      title: "Context that changes the picture",
      items: contextual,
      empty: "No additional context caveats were flagged by the evaluator.",
    },
  ];

  return (
    <div className="container-page max-w-6xl pb-24 pt-10 sm:pt-14">
      {/* ---------- Report masthead ---------- */}
      <motion.div {...stagger} className="mx-auto max-w-3xl text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-verdict-green-line bg-verdict-green-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-verdict-green">
            <span className="h-1.5 w-1.5 rounded-full bg-verdict-green" />
            Verification complete
          </span>
        </div>
        <h1 className="mt-6 font-serif text-[30px] leading-[1.2] text-ink-900 sm:text-[38px]">
          &ldquo;{report.claim}&rdquo;
        </h1>
        <p className="mt-4 text-[13px] text-ink-400">
          Verified {formatDateTime(report.verifiedAt)}
          {elapsedSeconds ? ` · researched in ${elapsedSeconds}s` : ""}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <CopyButton getText={() => report.claim} label="Copy claim" toast={(ok) => onToast(ok ? "success" : "error", ok ? "Claim copied" : "Copy failed")} />
          <CopyButton
            getText={() => reportToMarkdown(report)}
            label="Copy report"
            toast={(ok) => onToast(ok ? "success" : "error", ok ? "Report copied as Markdown" : "Copy failed")}
          />
          <Link to="/" className="btn-ghost text-[13px] px-3.5 py-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Verify another claim
          </Link>
        </div>
      </motion.div>

      {/* ---------- Verdict panel ---------- */}
      <motion.div
        {...stagger}
        transition={{ ...stagger.transition, delay: 0.08 }}
        className="card mx-auto mt-12 overflow-hidden"
      >
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.55fr_1fr]">
          <div>
            <SectionTitle icon={ScrollText}>Verdict</SectionTitle>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <VerdictBadge verdict={report.verdict} size="lg" />
              <span className="text-[12px] font-medium uppercase tracking-eyebrow text-ink-400">
                based on {report.sources.length} retrieved sources
              </span>
            </div>
            <p className="mt-5 text-[16px] leading-7 text-ink-700">
              {report.summary}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-100 pt-5 text-[13px] text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-accent-500" />
                <strong className="font-semibold text-ink-700">
                  {report.independentSourceCount}
                </strong>{" "}
                independent {report.independentSourceCount === 1 ? "publisher" : "publishers"} carry relevant evidence
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileQuestion className="h-3.5 w-3.5 text-accent-500" />
                {report.subClaims.length} verifiable{" "}
                {report.subClaims.length === 1 ? "statement" : "statements"}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-ink-100 bg-paper-dim/60 p-5 sm:p-6">
            <ConfidenceMeter confidence={report.confidence} note={report.confidenceNote} />
          </div>
        </div>
      </motion.div>

      {/* ---------- Evidence workspace ---------- */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-12">
          {groups.map((g) => (
            <section key={g.key}>
              <div className="flex items-center justify-between">
                <SectionTitle
                  icon={g.key === "context" ? FileQuestion : Link2}
                >
                  {g.title}
                </SectionTitle>
                <span className="text-[12px] font-medium text-ink-400">
                  {g.items.length} {g.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              {g.items.length === 0 ? (
                <div className="card mt-4 border-dashed p-5 text-[14px] text-ink-400">
                  {g.empty}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {g.items.map((item, i) => (
                    <motion.div
                      key={`${g.key}-${item.sourceId}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 * i }}
                    >
                      <EvidenceCard item={item} sources={sources} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          ))}

          <section>
            <SectionTitle icon={Link2}>All retrieved sources</SectionTitle>
            <p className="mt-2 text-[13px] leading-6 text-ink-400">
              Every page consulted during research — including sources that
              turned out not to be relevant. Open them to verify independently.
            </p>
            <div className="mt-4 space-y-3">
              {report.sources.map((s) => (
                <SourceCard key={s.id} source={s} />
              ))}
            </div>
          </section>
        </div>

        {/* ---------- Analysis column ---------- */}
        <div className="space-y-8 lg:sticky lg:top-20">
          <section className="card p-5 sm:p-6">
            <SectionTitle icon={ScrollText}>Why this verdict</SectionTitle>
            <p className="mt-4 text-[14px] leading-7 text-ink-600">
              {report.assessment.rationale}
            </p>
          </section>

          {report.subClaims.length > 0 && (
            <section>
              <SectionTitle icon={FileQuestion}>Claim breakdown</SectionTitle>
              <div className="mt-4 space-y-3">
                {report.subClaims.map((sc, i) => (
                  <SubClaimDisclosure
                    key={i}
                    index={i + 1}
                    text={sc.text}
                    defaultOpen={report.subClaims.length === 1}
                    verdictNode={
                      sc.verdict ? (
                        <VerdictBadge verdict={sc.verdict} size="sm" />
                      ) : (
                        <span className="rounded-full border border-ink-200 bg-paper-dim px-2 py-0.5 text-[11px] font-medium text-ink-400">
                          not researched
                        </span>
                      )
                    }
                    explanation={sc.explanation}
                  >
                    {sc.evidence.length > 0 ? (
                      sc.evidence.map((e, j) => (
                        <EvidenceCard key={j} item={e} sources={sources} />
                      ))
                    ) : (
                      <p className="text-[13px] italic text-ink-400">
                        No directly relevant evidence was attributed to this
                        statement.
                      </p>
                    )}
                  </SubClaimDisclosure>
                ))}
              </div>
            </section>
          )}

          <section className="card p-5 sm:p-6">
            <SectionTitle icon={ScrollText}>Final assessment</SectionTitle>
            <div className="mt-4 space-y-4 text-[14px] leading-6">
              <AssessList kind="established" items={report.assessment.established} />
              <AssessList kind="disputed" items={report.assessment.disputed} />
              <AssessList kind="uncertain" items={report.assessment.uncertain} />
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <SectionTitle icon={FileQuestion}>Transparency notes</SectionTitle>
            <p className="mt-3 text-[13px] leading-6 text-ink-500">
              {report.limitations}
            </p>
            {report.searchQueries.length > 0 && (
              <div className="mt-4">
                <div className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-400">
                  Live search queries run
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {report.searchQueries.map((q, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-ink-100 bg-paper-dim px-2.5 py-1 text-[12px] text-ink-500"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <p className="text-[12px] leading-6 text-ink-400">
            Excerpts are quoted from material retrieved during this run. AI
            interpretation is confined to classification and the summary above
            — open the sources and judge for yourself.
          </p>
        </div>
      </div>
    </div>
  );
}

function AssessList({
  kind,
  items,
}: {
  kind: "established" | "disputed" | "uncertain";
  items: string[];
}) {
  const meta = {
    established: { label: "What the evidence establishes", dot: "bg-verdict-green" },
    disputed: { label: "What is disputed", dot: "bg-verdict-red" },
    uncertain: { label: "What remains uncertain", dot: "bg-verdict-amber" },
  }[kind];
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-eyebrow text-ink-400">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </div>
      <ul className="mt-2 space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-ink-600">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-300" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
