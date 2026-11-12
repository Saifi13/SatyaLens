import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ScanSearch, X } from "lucide-react";

const MAX = 1000;
const EXAMPLES = [
  "India has the largest railway network in the world.",
  "The Great Wall of China is visible from space with the naked eye.",
  "Oxford University is older than the Aztec Empire.",
];

export default function ClaimBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const tooShort = value.trim().length > 0 && value.trim().length < 10;

  const submit = (claim?: string) => {
    const text = (claim ?? value).trim();
    if (text.length < 10 || busy) return;
    setBusy(true);
    navigate(`/verify?claim=${encodeURIComponent(text)}`);
  };

  return (
    <div
      id="claim-input"
      className="card overflow-hidden shadow-lift transition-shadow duration-300 focus-within:border-accent-300"
    >
      <label htmlFor="claim-textarea" className="sr-only">
        Enter a factual claim to verify
      </label>
      <div className="relative">
        <textarea
          id="claim-textarea"
          ref={areaRef}
          autoFocus={autoFocus}
          value={value}
          maxLength={MAX}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
          rows={3}
          placeholder="Paste a claim you want checked — a news headline, a viral statement, a statistic…"
          className="w-full resize-none bg-transparent px-6 pt-6 pb-3 text-[17px] leading-7 text-ink-900 placeholder:text-ink-300 focus:outline-none sm:text-lg"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              areaRef.current?.focus();
            }}
            aria-label="Clear input"
            className="absolute right-4 top-4 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-ink-100 bg-paper-dim/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-[13px]">
          <span
            className={`tabular-nums ${
              value.length > MAX * 0.9 ? "text-verdict-amber" : "text-ink-400"
            }`}
            aria-live="polite"
          >
            {value.length.toLocaleString()}/{MAX.toLocaleString()}
          </span>
          {tooShort && (
            <span className="text-verdict-amber">A little more detail helps.</span>
          )}
        </div>
        <button
          onClick={() => submit()}
          disabled={value.trim().length < 10 || busy}
          className="btn-accent w-full sm:w-auto"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ScanSearch className="h-4 w-4" />
          )}
          {busy ? "Starting research…" : "Verify Claim"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 px-6 py-4">
        <span className="text-[13px] font-medium text-ink-400">Try an example:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setValue(ex);
              submit(ex);
            }}
            className="rounded-full border border-ink-200 bg-paper-card px-3 py-1.5 text-[13px] text-ink-600 transition-all duration-150 hover:border-accent-300 hover:text-accent-700 hover:shadow-card active:translate-y-px"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
