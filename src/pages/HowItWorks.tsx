import { Link } from "react-router-dom";
import { PageHero, Section, StepRow } from "../components/PageBits";

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            From a pasted claim to an{" "}
            <span className="italic text-accent-700">auditable verdict</span>
          </>
        }
        lead="Seven real stages run in front of you. Nothing is simulated, nothing is pre-answered, and every factual line in the report traces back to a source you can open."
      />

      <Section tone="card" title="The journey of your claim">
        <StepRow n={1} title="Understanding the statement">
          The model maps what you actually said — the entities, dates, places,
          and numbers involved — and identifies ambiguity or missing context
          before anything else happens. It deliberately does not decide
          truthfulness here.
        </StepRow>
        <StepRow n={2} title="Extracting verifiable claims">
          Long statements often bundle several assertions. SatyaLens splits
          them into atomic factual claims, sets opinion and rhetoric aside,
          and derives focused search queries for each checkable statement.
        </StepRow>
        <StepRow n={3} title="Searching live sources">
          Queries run against a real web-search API at verification time. The
          system is not consulting the model&apos;s memory of the internet —
          it is on the internet, now.
        </StepRow>
        <StepRow n={4} title="Reading the sources">
          Result pages are fetched and reduced to readable text, respecting
          robots.txt and rate limits. If a page can&apos;t be retrieved, the
          report says so; snippet-only evidence is always labelled.
        </StepRow>
        <StepRow n={5} title="Evaluating the evidence">
          Each source is examined against each sub-claim: does the material
          support it, contradict it, or merely provide context? Excerpts are
          quoted verbatim from what was retrieved.
        </StepRow>
        <StepRow n={6} title="Comparing findings">
          Confirmation is counted by independent publishers, not by echo. Five
          sites repeating one original report are treated as one source, and
          conflicting evidence is surfaced rather than averaged away.
        </StepRow>
        <StepRow n={7} title="Writing your report">
          The verdict engine decides only from the evaluated findings. If the
          evidence is thin, the verdict is Insufficient Evidence — an honest
          dead end rather than a confident guess.
        </StepRow>
      </Section>

      <Section title="What you get at the end">
        <p>
          A report with a verdict, calibrated confidence, the original claim,
          its breakdown, supporting and contradicting evidence with quotes,
          every retrieved source with links, and an explicit list of what
          remains uncertain.
        </p>
        <div className="pt-2">
          <Link to="/" className="btn-accent">
            Try it with a real claim
          </Link>
        </div>
      </Section>
    </>
  );
}
