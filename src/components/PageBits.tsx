import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
}) {
  return (
    <section className="border-b border-ink-100 bg-paper-card">
      <div className="container-page max-w-3xl py-20 text-center sm:py-24">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="eyebrow"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-5 font-serif text-[38px] leading-[1.12] text-ink-900 sm:text-5xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-xl text-[16px] leading-7 text-ink-500"
        >
          {lead}
        </motion.p>
      </div>
    </section>
  );
}

export function Section({
  title,
  children,
  tone = "paper",
  anchor,
}: {
  title?: string;
  children: ReactNode;
  tone?: "paper" | "dim" | "card";
  anchor?: string;
}) {
  const bg =
    tone === "dim"
      ? "bg-paper-dim"
      : tone === "card"
        ? "bg-paper-card border-b border-ink-100"
        : "bg-paper";
  return (
    <section id={anchor} className={`${bg}`}>
      <div className="container-page max-w-3xl py-16 sm:py-20">
        {title && (
          <h2 className="font-serif text-3xl leading-tight text-ink-900">
            {title}
          </h2>
        )}
        <div className="mt-6 space-y-5 text-[15px] leading-7 text-ink-600">
          {children}
        </div>
      </div>
    </section>
  );
}

export function StepRow({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative -ml-px border-l border-ink-200 pb-10 pl-8 last:pb-0">
      <span className="absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-ink-200 bg-paper text-[12px] font-semibold text-accent-600">
        {n}
      </span>
      <h3 className="text-[17px] font-semibold text-ink-800">{title}</h3>
      <div className="mt-2 text-[15px] leading-7 text-ink-500">{children}</div>
    </div>
  );
}
