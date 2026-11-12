import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Globe,
  Quote,
} from "lucide-react";
import type { EvidenceItem, SourceCategory, SourceRef } from "../../types";
import { formatDate } from "../../lib/format";

export const CATEGORY_META: Record<
  SourceCategory,
  { label: string; cls: string }
> = {
  government: {
    label: "Government / official",
    cls: "bg-accent-50 text-accent-700 border-accent-100",
  },
  research: {
    label: "Research / academic",
    cls: "bg-ink-50 text-ink-600 border-ink-200",
  },
  factcheck: {
    label: "Fact-checker",
    cls: "bg-verdict-amber-soft text-verdict-amber border-verdict-amber-line",
  },
  reference: {
    label: "Reference work",
    cls: "bg-ink-50 text-ink-600 border-ink-200",
  },
  news: {
    label: "Established news",
    cls: "bg-ink-50 text-ink-600 border-ink-200",
  },
  "other": {
    label: "Other",
    cls: "bg-paper-dim text-ink-400 border-ink-100",
  },
};

function Favicon({ domain }: { domain: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-100 bg-paper-dim">
        <Globe className="h-3.5 w-3.5 text-ink-400" />
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`}
      alt=""
      width={24}
      height={24}
      onError={() => setFailed(true)}
      className="h-6 w-6 rounded-md border border-ink-100 bg-white object-contain p-0.5"
    />
  );
}

export function SourceMeta({
  source,
  dense = false,
}: {
  source: SourceRef;
  dense?: boolean;
}) {
  const cat = CATEGORY_META[source.category];
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      <Favicon domain={source.domain} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-ink-800">
            {source.publisher}
          </span>
          {!dense && (
            <span
              className={`hidden shrink-0 rounded-full border px-2 py-px text-[11px] font-medium sm:inline ${cat.cls}`}
            >
              {cat.label}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-400">
          <span className="truncate">
            {dense ? source.domain : formatDate(source.publishedAt)}
          </span>
          {!source.accessed && (
            <span className="shrink-0 rounded-full bg-paper-dim px-1.5 py-px text-[10px] font-medium text-ink-500">
              snippet only
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function SourceCard({ source }: { source: SourceRef }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group flex items-center gap-3 px-4 py-3.5 transition-all duration-200 hover:border-accent-200 hover:shadow-lift"
    >
      <SourceMeta source={source} />
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-[13px] text-ink-500 group-hover:text-ink-700">
          {source.title}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-accent-600">
          Open original
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

const REL_META = {
  supports: {
    label: "Supports",
    dot: "bg-verdict-green",
    pill: "text-verdict-green bg-verdict-green-soft border-verdict-green-line",
  },
  contradicts: {
    label: "Contradicts",
    dot: "bg-verdict-red",
    pill: "text-verdict-red bg-verdict-red-soft border-verdict-red-line",
  },
  context: {
    label: "Context",
    dot: "bg-verdict-amber",
    pill: "text-verdict-amber bg-verdict-amber-soft border-verdict-amber-line",
  },
} as const;

export function EvidenceCard({
  item,
  sources,
}: {
  item: EvidenceItem;
  sources: Map<string, SourceRef>;
}) {
  const source = sources.get(item.sourceId);
  if (!source) return null;
  const rel = REL_META[item.relation];
  return (
    <article className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-paper-dim/50 px-4 py-3">
        <SourceMeta source={source} dense />
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${rel.pill}`}
        >
          {rel.label}
        </span>
      </div>
      <div className="px-4 pb-4 pt-3.5">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <h4 className="text-[14px] font-semibold leading-6 text-ink-800 group-hover:text-accent-700">
            {source.title}
            <span className="text-ink-300"> ↗</span>
          </h4>
        </a>
        <div className="mt-3 flex gap-2.5">
          <Quote className="h-4 w-4 shrink-0 text-ink-300" />
          <p className="border-l-2 border-ink-100 pl-3 text-[14px] italic leading-6 text-ink-600">
            {item.excerpt}
          </p>
        </div>
        <p className="mt-3 text-[13px] leading-6 text-ink-500">
          <span className="font-semibold text-ink-600">Why it matters:</span>{" "}
          {item.why}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ink-400">
          <span className={`h-1.5 w-1.5 rounded-full ${REL_META[item.relation].dot}`} />
          <span>{source.domain}</span>
          <span aria-hidden>·</span>
          <span>{CATEGORY_META[source.category].label}</span>
          {source.publishedAt && (
            <>
              <span aria-hidden>·</span>
              <span>{formatDate(source.publishedAt)}</span>
            </>
          )}
          {!source.accessed && (
            <>
              <span aria-hidden>·</span>
              <span className="rounded-full bg-paper-dim px-1.5 py-px text-[10px] font-medium text-ink-500">
                page not retrieved — snippet only
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function SubClaimDisclosure({
  index,
  text,
  verdictNode,
  explanation,
  children,
  defaultOpen = false,
}: {
  index: number;
  text: string;
  verdictNode: React.ReactNode;
  explanation: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper-dim/60 sm:px-5"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-200 text-[11px] font-semibold text-ink-500">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium leading-6 text-ink-800">
            {text}
          </span>
          {!open && <span className="mt-0.5 block truncate text-[13px] text-ink-400">{explanation}</span>}
        </span>
        {verdictNode}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="border-t border-ink-100 px-4 py-4 sm:px-5">
          <p className="text-[14px] leading-6 text-ink-600">{explanation}</p>
          {children && <div className="mt-4 space-y-3">{children}</div>}
        </div>
      </motion.div>
    </div>
  );
}
