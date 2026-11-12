import { Link } from "react-router-dom";
import { PageHero, Section } from "../components/PageBits";
import { Lock, Database, EyeOff } from "lucide-react";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            Satya means truth.{" "}
            <span className="italic text-accent-700">A lens focuses it.</span>
          </>
        }
        lead="SatyaLens is an AI-assisted fact verification platform for people who would rather see the evidence than be told the answer."
      />

      <Section tone="card" title="Why this exists">
        <p>
          Misinformation is no longer mostly fabricated — it is recycled,
          decontextualized, exaggerated, and out of date. A false framing of a
          real statistic spreads faster than the correction. Individuals face
          a research project every time they want to check what they read;
          most simply can&apos;t afford it.
        </p>
        <p>
          The damage is concrete: health decisions made on invented guidance,
          money moved by scams wearing official language, elections argued
          about doctored clips, and trust evaporating across all information.
          Verifying one claim well is cheap; collectively believing false ones
          is not.
        </p>
      </Section>

      <Section title="How AI helps — and where it stops">
        <p>
          Large language models are good at exactly the mechanical parts of
          fact-checking: decomposing a statement, planning searches, reading
          retrieved pages, and quoting them precisely. They are bad at being
          an authority: their memory is stale, un-verifiable, and prone to
          confident errors.
        </p>
        <p>
          So SatyaLens splits the roles. The model is the researcher and
          scribe. The live web is the evidence. The user is the judge. AI
          never decides truth from memory — it decides from what it just
          retrieved, and it must show which source every statement leans on.
        </p>
      </Section>

      <Section tone="card" title="How sources are treated">
        <p>
          Not all sources are equal, and not all equal-looking sources are
          independent. The pipeline prioritizes official and primary
          documents, established fact-checkers and accountable journalism,
          and it explicitly tracks whether multiple hits actually represent
          multiple publishers. Social posts and anonymous content are never
          authoritative. Read the full rules on the{" "}
          <Link to="/methodology" className="font-medium text-accent-700 underline decoration-accent-200 hover:decoration-accent-400">
            Methodology
          </Link>{" "}
          page.
        </p>
      </Section>

      <Section title="Why transparency is the product">
        <p>
          A verdict is one word. Trust is the receipts: the quote, the page,
          the date, the link, the acknowledged gap. SatyaLens is designed so
          that if you disagree with the verdict, you can usually find the
          exact piece of evidence where the disagreement starts. That is the
          whole philosophy —{" "}
          <em>AI should not ask you to trust its answer; it should give you
          the evidence to verify the answer yourself.</em>
        </p>
      </Section>

      <Section tone="card" anchor="limits" title="Limitations, stated plainly">
        <ul className="space-y-3">
          {[
            "Automated verification can be wrong. Treat every report as a well-organized starting point, not a final ruling.",
            "Paywalls, dead pages and robots.txt restrictions can limit what is retrievable.",
            "Coverage skews toward well-indexed sources; local or very recent claims may lack evidence in any language you'd trust.",
            "Some verdicts are 'Insufficient Evidence' when you might want an answer — that is deliberate.",
          ].map((l) => (
            <li key={l} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-verdict-amber" />
              {l}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Privacy — by architecture, not by promise">
        <div className="grid gap-5 pt-2 sm:grid-cols-3">
          {[
            { icon: Database, title: "No database", body: "There is no storage to breach. No claims, reports or identities persist anywhere." },
            { icon: EyeOff, title: "No accounts", body: "No sign-up, no tracking, no analytics beyond what a server must log to stay alive." },
            { icon: Lock, title: "Keys stay server-side", body: "AI and search API keys are only used by the server route. The browser never receives them." },
          ].map((p) => (
            <div key={p.title} className="card p-5">
              <p.icon className="h-5 w-5 text-accent-600" strokeWidth={1.8} />
              <h3 className="mt-3 text-[15px] font-semibold text-ink-800">{p.title}</h3>
              <p className="mt-2 text-[13.5px] leading-6 text-ink-500">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="pt-3 text-[14px] text-ink-400">
          Every verification runs independently. Refresh or close the page and
          the work disappears — that is the design, not a bug.
        </p>
      </Section>
    </>
  );
}
