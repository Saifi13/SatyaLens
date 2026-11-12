import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Compass,
  Eye,
  FileSearch,
  Landmark,
  Lock,
  Quote,
  SearchCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ClaimBox from "../components/ClaimBox";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function EvidenceConstellation() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 720 220"
      className="pointer-events-none absolute left-1/2 top-8 -z-0 w-[900px] max-w-none -translate-x-1/2 opacity-[0.5] sm:opacity-70"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="90%" r="70%">
          <stop offset="0%" stopColor="#4766CE" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#4766CE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="720" height="220" fill="url(#glow)" />
      {[
        [60, 40], [180, 24], [300, 44], [420, 20], [540, 44], [660, 30],
      ].map(([x, y], i) => (
        <g key={i}>
          <line
            x1={x}
            y1={y + 8}
            x2={360}
            y2={196}
            stroke="#1B2438"
            strokeOpacity={0.10}
            strokeWidth="1"
          />
          <circle cx={x} cy={y} r="4.5" fill="#FAFAF8" stroke="#4766CE" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="1.8" fill="#4766CE" fillOpacity="0.55" />
        </g>
      ))}
      <circle cx="360" cy="200" r="7" fill="#0B1222" fillOpacity="0.85" />
      <circle cx="360" cy="200" r="13" fill="none" stroke="#0B1222" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}

export default function Home() {
  const [params] = useSearchParams();
  useEffect(() => {
    if (params.get("focus") === "1") {
      requestAnimationFrame(() => {
        document
          .getElementById("claim-input")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document
          .querySelector<HTMLTextAreaElement>("#claim-input textarea")
          ?.focus({ preventScroll: true });
      });
    }
  }, [params]);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="container-page relative pb-24 pt-20 sm:pt-28">
          <EvidenceConstellation />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="eyebrow"
            >
              AI-powered · evidence-based fact verification
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className="mt-5 font-serif text-[44px] leading-[1.08] text-ink-900 sm:text-6xl"
            >
              Truth deserves{" "}
              <span className="italic text-accent-700">more than a guess</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="mx-auto mt-6 max-w-xl text-[17px] leading-7 text-ink-500"
            >
              Investigate claims, uncover credible evidence, and make informed
              decisions. SatyaLens searches live sources and shows every
              excerpt — never its own memory.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto mt-10 max-w-2xl"
          >
            <ClaimBox />
          </motion.div>
          <p className="relative z-10 mt-5 text-center text-[13px] text-ink-400">
            Every verdict is built from live web evidence — nothing is stored,
            nothing is pre-answered.
          </p>
        </div>
      </section>

      {/* ---------- Evidence before conclusions ---------- */}
      <section className="border-y border-ink-100 bg-paper-card">
        <div className="container-page grid gap-12 py-24 md:grid-cols-[1fr_1.1fr] md:items-center md:py-28">
          <motion.div {...fade}>
            <p className="eyebrow">Evidence before conclusions</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ink-900">
              A verdict you can audit, line by line.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-ink-500">
              SatyaLens will not ask you to trust its answer. Every report
              quotes the retrieved material, names the publisher, and links to
              the original page — so you can check the evidence yourself and
              reach your own conclusion.
            </p>
            <ul className="mt-7 space-y-3.5 text-[15px] text-ink-600">
              <li className="flex gap-3">
                <Quote className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                Verbatim excerpts — never paraphrased into something the
                source didn&apos;t say.
              </li>
              <li className="flex gap-3">
                <Eye className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                Snippet-only access is disclosed, never presented as a read.
              </li>
              <li className="flex gap-3">
                <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                Missing evidence yields{" "}
                <span className="font-medium text-ink-700">Insufficient
                Evidence</span> — an honest dead end, not a guessed one.
              </li>
            </ul>
          </motion.div>
          <motion.div {...fade} className="relative">
            <div className="rounded-2xl border border-ink-100 bg-paper p-5 sm:p-7">
              <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink-400">
                Illustrative — how evidence appears in a report
              </div>
              <div className="mt-5 space-y-3.5">
                <div className="card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-700">
                      <span className="h-2 w-2 rounded-full bg-verdict-green" />
                      Supporting evidence
                    </span>
                    <span className="rounded-full border border-verdict-green-line bg-verdict-green-soft px-2 py-0.5 text-[11px] font-semibold text-verdict-green">
                      Supports
                    </span>
                  </div>
                  <p className="mt-3 border-l-2 border-ink-100 pl-3 text-[13px] italic leading-6 text-ink-500">
                    &ldquo;…the official register lists the network at this
                    length as of the cited reporting year…&rdquo;
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-ink-400">
                    <span>publisher.gov · primary document</span>
                    <span className="underline decoration-ink-200">
                      open source ↗
                    </span>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-700">
                      <span className="h-2 w-2 rounded-full bg-verdict-amber" />
                      Context to weigh
                    </span>
                    <span className="rounded-full border border-verdict-amber-line bg-verdict-amber-soft px-2 py-0.5 text-[11px] font-semibold text-verdict-amber">
                      Context
                    </span>
                  </div>
                  <p className="mt-3 border-l-2 border-ink-100 pl-3 text-[13px] italic leading-6 text-ink-500">
                    &ldquo;…rankings differ depending on whether urban transit
                    is counted…&rdquo;
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-ink-400">
                    <span>search snippet only — page not retrieved</span>
                    <span className="underline decoration-ink-200">
                      open source ↗
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-8 right-16 h-8 rounded-2xl border border-ink-100/70 bg-paper-card/80" />
          </motion.div>
        </div>
      </section>

      {/* ---------- Independent sources ---------- */}
      <section className="bg-ink-900 text-paper">
        <div className="container-page py-24 md:py-28">
          <motion.div {...fade} className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-accent-300">
              Multiple independent sources
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-paper">
              One report echoing everywhere is not confirmation.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-ink-300">
              SatyaLens groups evidence by publisher and looks for genuinely
              independent reporting — then weighs sources by what they are
              authoritative about.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {[
              {
                icon: Landmark,
                tier: "Tier 1",
                title: "Primary & authoritative",
                body: "Government statistics, ministry publications, court records, international bodies, and peer-reviewed research — the material facts are built from.",
              },
              {
                icon: SearchCode,
                tier: "Tier 2",
                title: "Established fact-checkers",
                body: "Organizations with published correction policies and transparent methodology, used as targeted evidence — not as automatic truth.",
              },
              {
                icon: BookOpenCheck,
                tier: "Tier 3",
                title: "Accountable journalism",
                body: "Wires and outlets with named sourcing. Useful for corroboration, treated cautiously when multiple outlets repeat one original report.",
              },
            ].map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-6 md:pl-0"
              >
                <div className="hidden md:block">
                  <t.icon className="h-6 w-6 text-accent-300" strokeWidth={1.6} />
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink-400">
                    {t.tier}
                  </span>
                  <span className="h-px flex-1 bg-ink-700" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-paper">
                  {t.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-ink-400">
                  {t.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Method strip ---------- */}
      <section className="border-b border-ink-100 bg-paper">
        <div className="container-page py-24 md:py-28">
          <div className="grid gap-12 md:grid-cols-[1fr_1.25fr]">
            <motion.div {...fade}>
              <p className="eyebrow">A transparent method</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-ink-900">
                Seven stages. No shortcuts.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-ink-500">
                The pipeline is deliberately slow: understand first, search
                live, read what was retrieved, and only then decide. Each
                stage runs in front of you, with real status updates.
              </p>
              <a href="/methodology" className="btn-ghost mt-7">
                Read the full methodology
              </a>
            </motion.div>
            <motion.ol {...fade} className="relative space-y-0 border-l border-ink-200 pl-0">
              {[
                ["Understanding the statement", "Intent, entities and ambiguity are mapped — without deciding anything."],
                ["Extracting verifiable claims", "Opinions are set aside; atomic factual assertions are isolated."],
                ["Searching live sources", "Queries run against a real web-search API, prioritizing authoritative publishers."],
                ["Reading the sources", "Pages are fetched and parsed, respecting robots.txt; snippet-only access is disclosed."],
                ["Evaluating the evidence", "Each source is quoted and classified: supports, contradicts, or context."],
                ["Comparing findings", "Independent confirmation is counted by publisher, not by echo."],
                ["Writing your report", "Verdict, confidence, and limitations — every factual line traceable to a source."],
              ].map(([title, body], i) => (
                <li key={title} className="group relative -ml-px pl-7 pb-7 last:pb-0">
                  <span className="absolute left-0 top-0.5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-ink-200 bg-paper text-[11px] font-semibold text-ink-500 transition-colors group-hover:border-accent-400 group-hover:text-accent-600">
                    {i + 1}
                  </span>
                  <h3 className="text-[15px] font-semibold text-ink-800">{title}</h3>
                  <p className="mt-1 text-[14px] leading-6 text-ink-500">{body}</p>
                </li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>

      {/* ---------- Why trust ---------- */}
      <section className="bg-paper-dim">
        <div className="container-page py-24 md:py-28">
          <motion.div {...fade} className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Why trust SatyaLens</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ink-900">
              Built to earn trust by refusing to fake it.
            </h2>
          </motion.div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-x-14 gap-y-10 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Never invents evidence",
                body: "Verdicts come only from material retrieved during your run. If the web goes quiet, the report says so.",
              },
              {
                icon: Lock,
                title: "Nothing stored",
                body: "No accounts, no database, no history. Your claims exist only for the length of the verification.",
              },
              {
                icon: Sparkles,
                title: "Calibrated, not confident",
                body: "Low confidence and Insufficient Evidence are first-class outcomes, not failures to hide.",
              },
              {
                icon: Compass,
                title: "Injection-resistant",
                body: "Retrieved pages are handled as untrusted data. A webpage cannot tell the model what to conclude.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200/80 bg-paper-card">
                  <f.icon className="h-[18px] w-[18px] text-accent-600" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-ink-800">{f.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-ink-500">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-ink-950">
        <div className="container-page py-20 text-center md:py-24">
          <motion.div {...fade}>
            <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-tight text-paper sm:text-[44px]">
              Something doesn&apos;t smell right? Put it under the lens.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-ink-400">
              Paste the claim. Watch the research happen. Read the evidence.
              Decide for yourself.
            </p>
            <a
              href="/?focus=1"
              className="btn-accent mt-8 px-6 py-3.5 text-[15px]"
            >
              Verify a claim
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
