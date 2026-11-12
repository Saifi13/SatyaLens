import { CircleHelp, ShieldCheck, ShieldX } from "lucide-react";
import type { Confidence, Verdict } from "../types";

export const VERDICT_META: Record<
  Verdict,
  { label: string; icon: typeof ShieldCheck; bg: string; line: string; text: string; dot: string }
> = {
  SUPPORTED: {
    label: "Supported",
    icon: ShieldCheck,
    bg: "bg-verdict-green-soft",
    line: "border-verdict-green-line",
    text: "text-verdict-green",
    dot: "bg-verdict-green",
  },
  CONTRADICTED: {
    label: "Contradicted",
    icon: ShieldX,
    bg: "bg-verdict-red-soft",
    line: "border-verdict-red-line",
    text: "text-verdict-red",
    dot: "bg-verdict-red",
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Insufficient Evidence",
    icon: CircleHelp,
    bg: "bg-verdict-amber-soft",
    line: "border-verdict-amber-line",
    text: "text-verdict-amber",
    dot: "bg-verdict-amber",
  },
};

export function VerdictBadge({
  verdict,
  size = "md",
}: {
  verdict: Verdict;
  size?: "lg" | "md" | "sm";
}) {
  const m = VERDICT_META[verdict];
  const Icon = m.icon;
  const sizes = {
    lg: "px-4 py-2.5 text-[15px] gap-2.5 [&_svg]:h-5 [&_svg]:w-5",
    md: "px-3 py-1.5 text-[13px] gap-2 [&_svg]:h-4 [&_svg]:w-4",
    sm: "px-2.5 py-1 text-xs gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${m.bg} ${m.line} ${m.text} ${sizes[size]}`}
    >
      <Icon strokeWidth={2.2} />
      {m.label}
    </span>
  );
}

const CONF_FILL: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };
const CONF_LABEL: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function ConfidenceMeter({
  confidence,
  note,
}: {
  confidence: Confidence;
  note: string;
}) {
  const filled = CONF_FILL[confidence];
  const color =
    confidence === "high"
      ? "bg-verdict-green"
      : confidence === "medium"
        ? "bg-verdict-amber"
        : "bg-verdict-red";
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold uppercase tracking-eyebrow text-ink-500">
          Confidence
        </span>
        <span className="text-[13px] font-semibold text-ink-700">
          {CONF_LABEL[confidence]}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5" role="img" aria-label={`Confidence: ${CONF_LABEL[confidence]}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-10 overflow-hidden rounded-full ${i < filled ? color : "bg-ink-100"}`}
            style={{
              transition: "background-color 0.4s ease",
              transitionDelay: `${i * 90}ms`,
            }}
          />
        ))}
      </div>
      <p className="mt-2.5 text-[13px] leading-6 text-ink-500">{note}</p>
    </div>
  );
}
