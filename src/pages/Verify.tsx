import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RotateCcw, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import ClaimBox from "../components/ClaimBox";
import ReportView from "../components/report/ReportView";
import ResearchProcess, {
  type LiveSource,
  type StageState,
} from "../components/report/ResearchProcess";
import { useToast } from "../components/Toasts";
import { ApiError, runVerification } from "../lib/api";
import {
  STAGE_ORDER,
  type ActivityEvent,
  type StageId,
  type VerificationReport,
  type VerifyEvent,
} from "../types";

type Phase =
  | { name: "empty" }
  | { name: "running"; startedAt: number }
  | { name: "report"; report: VerificationReport; elapsed: number }
  | { name: "error"; code: string; message: string };

const initialStages = () =>
  Object.fromEntries(
    STAGE_ORDER.map((s) => [s, { status: "pending" } as StageState])
  ) as Record<StageId, StageState>;

export default function Verify() {
  const [params] = useSearchParams();
  const claim = (params.get("claim") ?? "").trim();
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>({ name: "empty" });
  const [stages, setStages] = useState<Record<StageId, StageState>>(initialStages);
  const [sources, setSources] = useState<LiveSource[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const finishedRef = useRef(false);
  const seenActivityRef = useRef(new Set<string>());

  const startRun = useCallback(
    (text: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const startedAt = Date.now();

      setStages(initialStages());
      setSources([]);
      setActivity([]);
      seenActivityRef.current = new Set();
      finishedRef.current = false;
      setPhase({ name: "running", startedAt });

      const onEvent = (e: VerifyEvent) => {
        if (e.type === "stage") {
          setStages((prev) => ({
            ...prev,
            [e.data.stage]: { status: e.data.status, detail: e.data.detail },
          }));
        } else if (e.type === "activity") {
          if (seenActivityRef.current.has(e.data.id)) return;
          seenActivityRef.current.add(e.data.id);
          setActivity((prev) => [...prev, e.data]);
        } else if (e.type === "source") {
          setSources((prev) => {
            const incoming = e.data.source;
            const idx = prev.findIndex((s) => s.id === incoming.id);
            const nextStatus =
              e.data.phase === "found"
                ? incoming.accessStatus ?? "found"
                : e.data.phase === "reading"
                  ? "reading"
                  : e.data.phase === "read"
                    ? "opened"
                    : e.data.phase === "failed"
                      ? incoming.accessStatus ?? (e.data.snippet || incoming.snippet ? "snippet" : "failed")
                      : incoming.accessStatus ?? prev[idx]?.accessStatus ?? "found";
            const merged: LiveSource = {
              ...(idx >= 0 ? prev[idx] : incoming),
              ...incoming,
              snippet: e.data.snippet ?? incoming.snippet ?? (idx >= 0 ? prev[idx].snippet : undefined),
              failReason: e.data.failReason ?? incoming.failReason,
              retrievedAt: e.data.retrievedAt ?? incoming.retrievedAt,
              relation: e.data.relation ?? (idx >= 0 ? prev[idx].relation : undefined),
              accessStatus: nextStatus,
            };
            if (idx < 0) return [...prev, merged];
            const copy = [...prev];
            copy[idx] = merged;
            return copy;
          });
        } else if (e.type === "report") {
          finishedRef.current = true;
          setPhase({
            name: "report",
            report: e.data,
            elapsed: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
          });
        } else if (e.type === "error") {
          finishedRef.current = true;
          setStages((prev) => {
            const next = { ...prev };
            for (const id of STAGE_ORDER) {
              if (next[id].status === "running")
                next[id] = { status: "failed", detail: e.data.message };
            }
            return next;
          });
          setPhase({ name: "error", code: e.data.code, message: e.data.message });
        }
      };

      runVerification(text, onEvent, controller.signal)
        .then(() => {
          if (controller.signal.aborted || finishedRef.current) return;
          finishedRef.current = true;
          setStages((prev) => {
            const next = { ...prev };
            for (const id of STAGE_ORDER) {
              if (next[id].status === "running")
                next[id] = {
                  status: "failed",
                  detail: "The live connection ended before a report was produced.",
                };
            }
            return next;
          });
          setPhase({
            name: "error",
            code: "STREAM_ENDED",
            message:
              "The verification stream ended before a report arrived. Retry to resume from a new investigation — SatyaLens will not invent a result.",
          });
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          finishedRef.current = true;
          const apiErr = err as ApiError;
          setPhase({
            name: "error",
            code: apiErr.code ?? "UNKNOWN",
            message:
              apiErr.message ??
              "Verification failed unexpectedly. No result is fabricated in its place.",
          });
        });
    },
    []
  );

  useEffect(() => {
    if (claim) startRun(claim);
    else setPhase({ name: "empty" });
    return () => controllerRef.current?.abort();
  }, [claim, startRun]);

  if (phase.name === "empty") {
    return (
      <div className="container-page max-w-2xl px-5 pb-24 pt-20 sm:px-8">
        <p className="eyebrow text-center">New verification</p>
        <h1 className="mt-4 text-center font-serif text-4xl leading-tight text-ink-900">
          What should we put under the lens?
        </h1>
        <div className="mt-9">
          <ClaimBox autoFocus />
        </div>
      </div>
    );
  }

  if (phase.name === "running") {
    return (
      <ResearchProcess
        claim={claim}
        stages={stages}
        sources={sources}
        activity={activity}
        startedAt={phase.startedAt}
        onRetry={() => startRun(claim)}
      />
    );
  }

  if (phase.name === "error") {
    return (
      <div className="container-page max-w-2xl px-5 pb-28 pt-20 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {phase.code === "CONFIG_MISSING" ? (
            <ConfigPanel message={phase.message} />
          ) : (
            <div className="card p-8 text-left sm:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-verdict-red-soft">
                <AlertTriangle className="h-5 w-5 text-verdict-red" />
              </div>
              <h1 className="mt-6 text-center font-serif text-3xl text-ink-900">
                This verification did not complete
              </h1>
              <p className="prose-copy mt-4 text-center">{phase.message}</p>
              <p className="prose-copy mt-3 text-center text-ink-400">
                SatyaLens never substitutes a fabricated report when research
                fails — there is no verdict below because there is no evidence
                above it.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => startRun(claim)} className="btn-accent">
                  <RotateCcw className="h-4 w-4" />
                  Retry research
                </button>
                <a href="/" className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <ReportView
      report={phase.report}
      elapsedSeconds={phase.elapsed}
      onToast={toast}
    />
  );
}

function ConfigPanel({ message }: { message: string }) {
  return (
    <div className="card p-8 text-left sm:p-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-verdict-amber-soft">
        <Settings2 className="h-5 w-5 text-verdict-amber" />
      </div>
      <h1 className="mt-6 text-center font-serif text-3xl text-ink-900">
        SatyaLens isn&apos;t configured yet
      </h1>
      <p className="prose-copy mt-4 text-center">{message}</p>
      <div className="mt-6 rounded-lg border border-ink-100 bg-ink-900 p-5">
        <div className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-400">
          Setup — create a .env file in the project root
        </div>
        <pre className="mt-3 overflow-x-auto text-[12.5px] leading-6 text-paper">{`.env
AI_API_KEY=your-provider-key      # any OpenAI-compatible endpoint
AI_BASE_URL=https://api.openai.com/v1   # optional
AI_MODEL=gpt-4o-mini                    # optional
SEARCH_PROVIDER=tavily             # "tavily" or "brave"
SEARCH_API_KEY=your-search-key`}</pre>
      </div>
      <p className="mt-5 text-center text-[13px] leading-6 text-ink-400">
        Without live providers, no verification runs and no verdict is shown.
        Keys stay on the server — the browser never sees them.
      </p>
    </div>
  );
}
