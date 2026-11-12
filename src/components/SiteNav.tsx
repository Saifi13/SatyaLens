import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ScanSearch } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/how-it-works", label: "How it works" },
  { to: "/methodology", label: "Methodology" },
  { to: "/about", label: "About" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const startVerification = () => {
    if (pathname === "/") {
      document
        .getElementById("claim-input")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      const ta = document.querySelector<HTMLTextAreaElement>("#claim-input textarea");
      ta?.focus({ preventScroll: true });
    } else {
      navigate("/?focus=1");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" aria-label="SatyaLens home" className="rounded-md">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-ink-900"
                    : "text-ink-500 hover:text-ink-900"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <button onClick={startVerification} className="btn-accent px-4 py-2.5 text-[13px]">
            <ScanSearch className="h-4 w-4" strokeWidth={2} />
            Verify a Claim
          </button>
        </div>

        <button
          className="rounded-md p-2 text-ink-700 hover:bg-ink-50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink-100 bg-paper md:hidden"
            aria-label="Mobile"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-700 hover:bg-ink-50"
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  startVerification();
                }}
                className="btn-accent mt-2"
              >
                <ScanSearch className="h-4 w-4" />
                Verify a Claim
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
