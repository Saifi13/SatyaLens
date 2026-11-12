import { PageHero, Section } from "../components/PageBits";
import { VERDICT_META } from "../components/Verdict";
import type { Verdict } from "../types";

const VERDICT_DESCRIPTIONS: Record<Verdict, string> = {
  SUPPORTED:
    "Credible retrieved evidence supports the claim. This does not mean it is proven beyond all doubt — it means the sources gathered in this run point that way, and they are shown to you.",
  CONTRADICTED:
    "Credible retrieved evidence directly contradicts the claim. The contradicting material is quoted in full so you can judge its strength yourself.",
  INSUFFICIENT_EVIDENCE:
    "There was not enough reliable, relevant evidence to establish or reject the claim. This is a genuine outcome, not a failure — partly-true or misleading claims also land here with an explanation of which part holds and which doesn't.",
};

export default function Methodology() {
  return (
    <>
      <PageHero
        eyebrow="Methodology"
        title={
          <>
            How SatyaLens decides —{" "}
            <span className="italic text-accent-700">in the open</span>
          </>
        }
        lead="A fact-verification tool that won't show you its reasoning is just an oracle with better fonts. Here is exactly how evidence is found, weighed, and turned into a verdict."
      />

      <Section tone="card" title="1 · Evidence is retrieved, never recalled">
        <p>
          The language model understands your claim and plans research, but it
          is explicitly forbidden from settling truth from pretrained memory.
          Every factual statement in a final report must trace to material{" "}
          <em>retrieved during your verification run</em>. If live research
          fails, the run fails loudly — a report is never generated in its
          place.
        </p>
      </Section>

      <Section title="2 · Source evaluation principles">
        <ul className="space-y-4">
          {[
            "Who published this, and are they authoritative for this specific subject? A physics journal is not an election witness.",
            "Is it a primary source (data, official document, court record) or a secondary echo of one?",
            "When was it published, and has the fact it reports likely changed since?",
            "Does it actually address the exact claim, or something adjacent?",
            "Is its evidence original, or is it repeating another outlet?",
            "Could the publisher have a conflict of interest in this topic?",
          ].map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
              {q}
            </li>
          ))}
        </ul>
        <p className="pt-2">
          Sources are grouped in tiers — primary/official documents,
          established fact-checkers with published corrections policies, and
          accountable journalism — as starting points, not automatic trust.
          Social media posts, anonymous blogs and AI-generated content are
          never treated as authoritative evidence.
        </p>
      </Section>

      <Section tone="card" title="3 · Independence over volume">
        <p>
          Multiple websites repeating the same original report do not add up
          to confirmation. SatyaLens counts independent publishers behind the
          evidence and reports that number in every verdict. A single
          authoritative source can be sufficient when appropriate — and the
          report discloses when it is the only one.
        </p>
      </Section>

      <Section title="4 · The three verdict categories">
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-paper-card shadow-card">
          {(Object.keys(VERDICT_DESCRIPTIONS) as Verdict[]).map((v, i) => (
            <div
              key={v}
              className={`flex flex-col gap-2 px-6 py-5 sm:flex-row sm:gap-6 ${
                i ? "border-t border-ink-100" : ""
              }`}
            >
              <div className="shrink-0 sm:w-48">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${VERDICT_META[v].bg} ${VERDICT_META[v].line} ${VERDICT_META[v].text}`}
                >
                  <span className={`h-2 w-2 rounded-full ${VERDICT_META[v].dot}`} />
                  {VERDICT_META[v].label}
                </span>
              </div>
              <p className="text-[14px] leading-6 text-ink-600">
                {VERDICT_DESCRIPTIONS[v]}
              </p>
            </div>
          ))}
        </div>
        <p className="pt-2 text-[14px] italic text-ink-400">
          A claim that is partly true is never forced into a binary box: the
          breakdown section of the report states which part is supported and
          which part is misleading.
        </p>
      </Section>

      <Section tone="card" title="5 · Safety rules the pipeline follows">
        <ul className="space-y-3">
          {[
            "Retrieved webpages are untrusted data, never instructions — a page cannot tell the model what to conclude.",
            "Claims are evaluated regardless of who made them or their affiliation.",
            "Correlation is not presented as causation; date and jurisdiction context are required.",
            "Medical, legal and financial claims get extra caution, preferring Insufficient Evidence over overstating.",
            "No unsupported accusations about individuals — statements are judged, people aren't.",
            "Quotations must appear literally in retrieved material; titles, dates and URLs are never invented.",
          ].map((r) => (
            <li key={r} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
              {r}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="6 · Known weaknesses">
        <p>
          Automated fact-checking is not court-grade verification. Paywalled
          primary sources can be unreachable. A claim can be verified against
          sources that are themselves wrong. Search coverage is biased toward
          well-indexed, English-heavy material. The model can misread a
          quotation. This is exactly why every report ends with clickable
          evidence instead of a confident sentence.
        </p>
      </Section>
    </>
  );
}
