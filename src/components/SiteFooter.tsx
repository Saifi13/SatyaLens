import { Link } from "react-router-dom";
import Logo from "./Logo";
import { ShieldCheck } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink-900 text-ink-300">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-ink-400">
              Evidence-based fact verification. SatyaLens retrieves live
              sources and shows its work — so you never have to take the
              AI&apos;s word for it.
            </p>
          </div>
          <nav aria-label="Product">
            <h3 className="text-[13px] font-semibold uppercase tracking-eyebrow text-ink-400">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-paper transition-colors">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-paper transition-colors">How it works</Link></li>
              <li><Link to="/methodology" className="hover:text-paper transition-colors">Methodology</Link></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3 className="text-[13px] font-semibold uppercase tracking-eyebrow text-ink-400">
              Learn
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-paper transition-colors">About</Link></li>
              <li><Link to="/about#limits" className="hover:text-paper transition-colors">Limitations</Link></li>
            </ul>
          </nav>
          <div>
            <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-eyebrow text-ink-400">
              <ShieldCheck className="h-4 w-4" /> Privacy by design
            </h3>
            <p className="mt-4 text-sm leading-6 text-ink-400">
              No accounts. No database. No tracking. Every verification runs
              independently and nothing is stored when you leave the page.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-ink-800 pt-6 text-[13px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} SatyaLens — Satya (truth) + Lens (focus).</span>
          <span>
            AI can make mistakes. Always read the original sources cited in a
            report.
          </span>
        </div>
      </div>
    </footer>
  );
}
