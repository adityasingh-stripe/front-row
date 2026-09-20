import { broadcastLog } from "./evidence/broadcast-log";
import { saveRate, signupRate } from "./engine";

export type PostRow = {
  title: string;
  views: number;
  saves: number;
  signups: number;
  saveRate: number;
  signupRate: number;
  reachRank: number;
  intentRank: number;
  cite: string;
  verdict: string;
};

/** Issued posts ranked by observed sign-up rate, not generated audience data. */
export function postRows(): PostRow[] {
  const byReach = [...broadcastLog].sort((a, b) => b.views - a.views);
  const byIntent = [...broadcastLog].sort((a, b) => signupRate(b) - signupRate(a));

  return byIntent.map((post, index) => ({
    title: post.title,
    views: post.views,
    saves: post.saves,
    signups: post.signups,
    saveRate: saveRate(post),
    signupRate: signupRate(post),
    reachRank: byReach.findIndex((item) => item.ref === post.ref) + 1,
    intentRank: index + 1,
    cite: post.ref,
    verdict: post.sheetVerdict,
  }));
}

export function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function ratePercent(rate: number, decimalPlaces = 3): string {
  return `${(rate * 100).toFixed(decimalPlaces)}%`;
}

export function formatName(format: string): string {
  const names: Record<string, string> = {
    "single-answer": "One answer to one person",
    "cost-breakdown": "Honest cost breakdown",
    procedure: "How I decide",
    recap: "Event recap",
    "refusal-list": "What I said no to",
  };
  return names[format] ?? format;
}
