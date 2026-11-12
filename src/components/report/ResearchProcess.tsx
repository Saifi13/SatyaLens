import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CircleAlert,
  Clock,
  ExternalLink,
  FileSearch,
  Globe,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  STAGE_HINTS,
  STAGE_LABELS,
  STAGE_ORDER,
  type ActivityEvent,
  type EvidenceRelation,
  type SourceAccessStatus,
  type SourceRef,
  type StageId,
  type StageStatus,
} from "../../types";
import { formatClock } from "../../lib/format";
import { CATEGORY_META } from "./parts";

export interface StageState {
  status: StageStatus;
  detail?: string;
}

export interface LiveSource extends SourceRef {
  snippet?: string;
  failReason?: string;
  accessStatus: SourceAccessStatus;
  relation?: EvidenceRelation;
}

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "running") {
    return (
      <span className="relative flex h-[18px] w-[18px] items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-accent-500/25 animate-pulse-dot" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-accent-600" />
      </span>
    );
  }
  if (status === "done")
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-verdict-green text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  if (status === "failed")
    return <CircleAlert className="h-[18px] w-[18px] text-verdict-red" />;
  return <span className="h-[18px] w-[18px] rounded-full border-2 border-ink-200" />;
}

function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const seconds = Math.max(0, Math.round((now - since) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span className="tabular-nums text-[13px] text-ink-400">
      {m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`} elapsed
    </span>
  );
}

function elapsedAt(startedAt: number, iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const seconds = Math.max(0, Math.round((t - startedAt) / 1000));
  return `+${seconds}s`;
}

const RELATION_META: Record<
  EvidenceRelation,
  { label: string; cls: string }
> = {
  supports: {
    label: "Supporting",
    cls: "bg-verdict-green-soft text-verdict-green border-verdict-green-line",
  },
  contradicts: {
    label: "Contradicting",
    cls: "bg-verdict-red-soft text-verdict-red border-verdict-red-line",
  },
  context: {
    label: "Contextual",
    cls: "bg-verdict-amber-soft text-verdict-amber border-verdict-amber-line",
  },
};

const ACCESS_META: Record<SourceAccessStatus, { label: string; cls: string }> = {
  found: { label: "Discovered", cls: "text-ink-400" },
  reading: { label: "Opening page", cls: "text-accent-600" },
  opened: { label: "Page opened", cls: "text-verdict-green" },
  snippet: { label: "Snippet only", cls: "text-verdict-amber" },
  failed: { label: "Retrieval failed", cls: "text-verdict-red" },
};

export default function ResearchProcess({
  claim,
  stages,
  sources,
  activity,
  startedAt,
  onRetry,
}: {
  claim: string;
  stages: Record<StageId, StageState>;
  sources: LiveSource[];
  activity: ActivityEvent[];
  startedAt: number;
  onRetry?: () => void;
}) {
  const reduce = useReducedMotion();
  const fade = reduce
    ? { initial: false as const, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const activeStage = STAGE_ORDER.find((id) => stages[id].status === "running");
  const failedStage = STAGE_ORDER.find((id) => stages[id].status === "failed");
  const opened = sources.filter((s) => s.accessStatus === "opened").length;
  const snippets = sources.filter((s) => s.accessStatus === "snippet").length;
  const failed = sources.filter((s) => s.accessStatus === "failed").length;

  const banner = useMemo(() => {
    if (failedStage) {
      return stages[failedStage].detail || `${STAGE_LABELS[failedStage]} failed`;
    }
    if (activeStage) return STAGE_HINTS[activeStage];
    return "SatyaLens is evaluating real evidence retrieved from live sources.";
  }, [activeStage, failedStage, stages]);

  return (
    <div className="mx-auto w-full max-w-desk px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <motion.div {...fade} transition={{ duration: reduce ? 0 : 0.45 }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Investigation desk</p>
            <h1 className="mt-3 max-w-4xl font-serif text-[22px] leading-snug text-ink-900 sm:text-[28px] lg:text-[32px]">
              &ldquo;{claim}&rdquo;
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-400">
            <Elapsed since={startedAt} />
            <span className="tabular-nums">
              {sources.length} {sources.length === 1 ? "source" : "sources"}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(240px,300px)]">
        <motion.aside
          {...fade}
          transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.05 }}
          className="card h-fit p-5 sm:p-6"
        >
          <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-400">
            Investigation timeline
          </h2>
          <ol className="mt-5">
            {STAGE_ORDER.map((id, i) => {
              const s = stages[id];
              const isLast = i === STAGE_ORDER.length - 1;
              return (
                <li key={id} className="relative flex gap-3.5 pb-6 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden
                      className={`absolute left-[8.5px] top-7 h-[calc(100%-14px)] w-px transition-colors duration-300 ${
                        s.status === "done"
                          ? "bg-verdict-green-line"
                          : s.status === "failed"
                            ? "bg-verdict-red-line"
                            : "bg-ink-100"
                      }`}
                    />
                  )}
                  <span className="relative z-10 mt-0.5">
                    <StageIcon status={s.status} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[14px] font-medium transition-colors duration-300 ${
                        s.status === "pending"
                          ? "text-ink-300"
                          : s.status === "running"
                            ? "text-ink-900"
                            : s.status === "failed"
                              ? "text-verdict-red"
                              : "text-ink-700"
                      }`}
                    >
                      {STAGE_LABELS[id]}
                    </span>
                    {s.status === "running" && (
                      <span className="mt-1 block text-[12.5px] leading-5 text-ink-500">
                        {STAGE_HINTS[id]}
                      </span>
                    )}
                    {s.detail && s.status !== "running" && (
                      <span className="mt-1 block text-[12.5px] leading-5 text-ink-500">
                        {s.detail}
                      </span>
                    )}
                    {s.status === "failed" && onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-600 hover:text-accent-700"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retry investigation
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </motion.aside>

        <motion.section
          {...fade}
          transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.08 }}
          className="min-w-0"
        >
          <div className="relative overflow-hidden rounded-xl border border-accent-100 bg-accent-50/70 px-4 py-3 sm:px-5">
            {!reduce && <span className="scan-bar" aria-hidden />}
            <p className="relative text-[13.5px] leading-6 text-ink-700">{banner}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-400">
              Live evidence board
            </h2>
            <p className="tabular-nums text-[12px] text-ink-400">
              {sources.length} found
              {sources.length > 0 && (
                <>
                  {" · "}
                  {opened} opened
                  {snippets > 0 ? ` · ${snippets} snippet` : ""}
                  {failed > 0 ? ` · ${failed} failed` : ""}
                </>
              )}
            </p>
          </div>

          {sources.length === 0 ? (
            <div className="card mt-3 flex flex-col items-center px-6 py-14 text-center">
              <FileSearch className="h-8 w-8 text-accent-400" strokeWidth={1.5} />
              <p className="mt-4 text-[15px] font-medium text-ink-700">
                Waiting for live search results
              </p>
              <p className="mt-1 max-w-sm text-[13px] leading-6 text-ink-400">
                Source cards appear here as the search provider returns them —
                nothing is generated in advance.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              <AnimatePresence initial={false}>
                {sources.map((source) => (
                  <SourceCardLive
                    key={source.id}
                    source={source}
                    reduce={Boolean(reduce)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>

        <motion.aside
          {...fade}
          transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.12 }}
          className="card flex max-h-[70vh] flex-col p-5 sm:p-6 lg:max-h-none"
        >
          <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-400">
            Live activity
          </h2>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            {activity.length === 0 ? (
              <p className="text-[13px] leading-6 text-ink-400">
                Pipeline events will list here as they happen.
              </p>
            ) : (
              <ol className="space-y-3.5">
                {[...activity].reverse().map((item) => (
                  <li key={item.id} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-5 text-ink-700">{item.message}</p>
                      <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] tabular-nums text-ink-400">
                        <span>{elapsedAt(startedAt, item.at)}</span>
                        <span>{formatClock(item.at)}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </motion.aside>
      </div>

      <div className="card mt-6 flex items-start gap-3 px-4 py-3.5 sm:px-5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
        <p className="text-[13px] leading-6 text-ink-600">
          SatyaLens is evaluating real evidence from live search and retrieved
          pages. The verification report and verdict appear only after this
          investigation finishes — never as a placeholder.
        </p>
      </div>
    </div>
  );
}

function SourceCardLive({
  source,
  reduce,
}: {
  source: LiveSource;
  reduce: boolean;
}) {
  const cat = CATEGORY_META[source.category];
  const access = ACCESS_META[source.accessStatus];
  const rel = source.relation ? RELATION_META[source.relation] : null;
  const stamp = source.retrievedAt || source.discoveredAt;

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Favicon domain={source.domain} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[13px] font-semibold text-ink-800">
              {source.publisher}
            </span>
            <span
              className={`rounded-full border px-2 py-px text-[10.5px] font-medium ${cat.cls}`}
            >
              {cat.label}
            </span>
            {rel && (
              <span
                className={`rounded-full border px-2 py-px text-[10.5px] font-medium ${rel.cls}`}
              >
                {rel.label}
              </span>
            )}
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex max-w-full items-start gap-1 text-[15px] font-medium leading-snug text-ink-900 hover:text-accent-700"
          >
            <span className="line-clamp-2">{source.title}</span>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" />
          </a>
          {source.snippet && (
            <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-ink-500">
              {source.accessStatus === "snippet" ? (
                <span className="mr-1 font-medium text-verdict-amber">
                  Search snippet:
                </span>
              ) : null}
              {source.snippet}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-400">
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {source.domain}
            </span>
            {stamp && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatClock(stamp)}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 font-medium ${access.cls}`}>
              {source.accessStatus === "reading" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : source.accessStatus === "opened" ? (
                <Check className="h-3 w-3" />
              ) : source.accessStatus === "failed" ? (
                <CircleAlert className="h-3 w-3" />
              ) : null}
              {access.label}
              {source.failReason ? ` — ${source.failReason}` : ""}
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

function Favicon({ domain }: { domain: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-100 bg-paper-dim">
        <Globe className="h-3.5 w-3.5 text-ink-400" />
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
      alt=""
      width={32}
      height={32}
      onError={() => setFailed(true)}
      className="h-8 w-8 shrink-0 rounded-lg border border-ink-100 bg-white object-contain p-1"
    />
  );
}
