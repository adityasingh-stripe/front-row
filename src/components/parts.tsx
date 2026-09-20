"use client";

import { createContext, useContext, type ReactNode } from "react";

/* ------------------------------------------------------------------ *
 * Provenance
 *
 * Evidence codes are for judges, not for Aditi. They live behind this toggle
 * and default to off. The product speaks her language; flip the switch and
 * every figure shows where it came from.
 * ------------------------------------------------------------------ */

const CiteContext = createContext(false);

export function FrontRowMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#1d3f6e" />
      <g fill="#fff" opacity="0.35">
        <circle cx="11" cy="8" r="1.45" />
        <circle cx="16" cy="8" r="1.45" />
        <circle cx="21" cy="8" r="1.45" />
      </g>
      <g fill="#fff" opacity="0.6">
        <circle cx="8.5" cy="14.25" r="1.65" />
        <circle cx="13.5" cy="14.25" r="1.65" />
        <circle cx="18.5" cy="14.25" r="1.65" />
        <circle cx="23.5" cy="14.25" r="1.65" />
      </g>
      <g fill="#fff">
        <circle cx="6" cy="22" r="1.9" />
        <circle cx="11" cy="22" r="1.9" />
        <circle cx="16" cy="22" r="1.9" />
        <circle cx="21" cy="22" r="1.9" />
        <circle cx="26" cy="22" r="1.9" />
      </g>
    </svg>
  );
}

export function CiteProvider({ on, children }: { on: boolean; children: ReactNode }) {
  return <CiteContext.Provider value={on}>{children}</CiteContext.Provider>;
}

export function useCite() {
  return useContext(CiteContext);
}

/** Renders nothing unless the provenance toggle is on. */
export function Cite({ children }: { children?: ReactNode }) {
  const on = useCite();
  if (!on || !children) return null;
  return (
    <span className="ml-2 inline-flex shrink-0 items-center rounded border border-brand/25 bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-brand">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Layout primitives
 * ------------------------------------------------------------------ */

export function Panel({
  children,
  className = "",
  tone = "surface",
}: {
  children: ReactNode;
  className?: string;
  tone?: "surface" | "ink" | "quiet";
}) {
  const tones = {
    surface: "bg-surface border-line",
    ink: "bg-ink text-white border-ink",
    quiet: "bg-transparent border-line",
  };
  return <section className={`rounded-lg border ${tones[tone]} ${className}`}>{children}</section>;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.11em] text-muted ${className}`}>
      {children}
    </p>
  );
}

export function Stat({
  value,
  label,
  note,
  cite,
  tone = "ink",
}: {
  value: string;
  label: string;
  note?: string;
  cite?: string;
  tone?: "ink" | "acted" | "blocked" | "brand";
}) {
  const tones = {
    ink: "text-ink",
    acted: "text-acted",
    blocked: "text-blocked",
    brand: "text-brand",
  };
  return (
    <div>
      <p className={`tnum text-[2.6rem] font-semibold leading-none tracking-[-0.03em] ${tones[tone]}`}>
        {value}
      </p>
      <p className="mt-3 text-[0.9rem] leading-6 text-ink-soft">
        {label}
        <Cite>{cite}</Cite>
      </p>
      {note && <p className="mt-1.5 text-[0.8rem] leading-5 text-muted">{note}</p>}
    </div>
  );
}

/** A proportional bar. Used to show reach against intent. */
export function Bar({
  fraction,
  tone = "ink",
}: {
  fraction: number;
  tone?: "ink" | "brand" | "faint";
}) {
  const tones = { ink: "bg-ink", brand: "bg-brand", faint: "bg-line-strong" };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className={`h-full rounded-full ${tones[tone]}`}
        style={{ width: `${Math.max(fraction * 100, 1.5)}%` }}
      />
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
  full?: boolean;
}) {
  const variants = {
    primary:
      "bg-ink text-white hover:bg-brand disabled:bg-line-strong disabled:text-faint disabled:cursor-not-allowed",
    secondary: "bg-surface text-ink border border-line-strong hover:border-ink",
    ghost: "bg-transparent text-muted hover:text-ink",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
        variants[variant]
      } ${full ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "acted" | "blocked" | "brand";
}) {
  const tones = {
    neutral: "bg-paper text-muted border-line",
    acted: "bg-acted-soft text-acted border-acted/25",
    blocked: "bg-blocked-soft text-blocked border-blocked/25",
    brand: "bg-brand-soft text-brand border-brand/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * The audience surface is a phone. 248K of her 320K audience are on Instagram,
 * so demoing the reader's view at desktop width misrepresents it.
 */
export function PhoneFrame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[400px] rounded-[2rem] border-[10px] border-ink bg-surface shadow-2xl">
        <div className="flex items-center justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-20 rounded-full bg-line-strong" />
        </div>
        <div className="max-h-[68vh] overflow-y-auto overscroll-contain rounded-b-[1.4rem] px-5 pb-6 pt-2">
          {children}
        </div>
      </div>
      {caption && <p className="mt-4 max-w-sm text-center text-xs leading-5 text-muted">{caption}</p>}
    </div>
  );
}

/** Small provenance or data-boundary note. */
export function ProvenanceNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-[11px] leading-5 text-muted">
      <span className="mt-[3px] inline-block h-1.5 w-1.5 shrink-0 rounded-full border border-faint" />
      <span>{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ *
 * Icons
 * ------------------------------------------------------------------ */

export function Arrow({ dir = "right" }: { dir?: "right" | "left" }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 ${dir === "left" ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M2.5 8h10M8.5 4l4 4-4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function Check() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M3 8.5 6 11.5 13 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function Forward() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M9 3.5 13.5 8 9 12.5M13 8H3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path d="M3.5 4v8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  );
}

export function Bookmark({ filled }: { filled?: boolean }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill={filled ? "currentColor" : "none"} viewBox="0 0 16 16">
      <path
        d="M4 2.5h8v11l-4-3-4 3v-11Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}
