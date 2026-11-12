export function LogoMark({
  className = "h-7 w-7",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const ring = tone === "dark" ? "#0B1222" : "#FAFAF8";
  const accent = tone === "dark" ? "#4766CE" : "#93AEEE";
  const check = tone === "dark" ? "#4766CE" : "#FAFAF8";
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="11" stroke={ring} strokeWidth="1.6" />
      <circle cx="14" cy="14" r="6.5" stroke={accent} strokeWidth="1.6" opacity="0.9" />
      <path
        d="M14 7.5a6.5 6.5 0 0 1 6.5 6.5"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M10.9 14.6l2.2 2.4 4-4.9"
        stroke={check}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  tone = "dark",
  compact = false,
}: {
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark tone={tone} className="h-7 w-7" />
      {!compact && (
        <span
          className={`text-[17px] tracking-tight ${
            tone === "dark" ? "text-ink-900" : "text-paper"
          }`}
        >
          <span className="font-medium">Satya</span>
          <span className={`font-semibold ${tone === "dark" ? "text-accent-600" : "text-accent-300"}`}>
            Lens
          </span>
        </span>
      )}
    </span>
  );
}
