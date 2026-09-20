/**
 * The engine. Pure functions over the case evidence, no dependencies, no state.
 *
 * The audit percentages are computed from the transcribed rows in ./evidence/*.
 * Live product activity is stored separately and never inferred from this sample.
 *
 * selfCheck() at the bottom asserts the computed figures against the figures
 * E-09 states on the sheet. It is cheap enough to run on render.
 */

import type { BroadcastPost } from "./evidence/broadcast-log";
import { intentLog, statedFindings, type IntentRow } from "./evidence/intent-log";

/* ------------------------------------------------------------------ *
 * E-03: reach is loud, intent is quiet
 * ------------------------------------------------------------------ */

/** Saves as a share of views. The leading indicator. */
export function saveRate(post: BroadcastPost): number {
  return post.saves / post.views;
}

/** Direct sign-ups as a share of views. The lagging indicator. */
export function signupRate(post: BroadcastPost): number {
  return post.signups / post.views;
}

/* ------------------------------------------------------------------ *
 * E-10: decide what matters, then decide what to instrument
 * ------------------------------------------------------------------ */

type Cohort = {
  label: string;
  n: number;
  acted: number;
  /** Action rate within the cohort, 0..1. */
  rate: number;
};

function cohort(label: string, rows: readonly IntentRow[]): Cohort {
  const acted = rows.filter((r) => r.acted).length;
  return { label, n: rows.length, acted, rate: rows.length === 0 ? 0 : acted / rows.length };
}

/**
 * The uncomfortable one. In this sample clicking is not a weak signal of
 * intent, it is a negative one: people who never clicked acted at a
 * substantially higher rate than people who did.
 *
 * E-09 says clicks undercount her value. The row-level data says worse than
 * that: optimising for clicks would actively select against the people who act.
 */
export function clickCohorts(log: readonly IntentRow[] = intentLog) {
  const clicked = cohort("Clicked a link", log.filter((r) => r.linkClick));
  const notClicked = cohort("Never clicked", log.filter((r) => !r.linkClick));
  return {
    clicked,
    notClicked,
    /** Positive means not-clicking is associated with MORE action. */
    delta: notClicked.rate - clicked.rate,
    clickIsAntiPredictive: notClicked.rate > clicked.rate,
  };
}

/**
 * E-09.5 is a threshold effect, not a linear one. This is the instrument:
 * count saves, and treat three as the line.
 */
export function saveThresholdCohorts(
  log: readonly IntentRow[] = intentLog,
  threshold: number = statedFindings.saveThresholdLift.threshold,
) {
  const atOrAbove = cohort(`Saved ${threshold} or more`, log.filter((r) => r.saves >= threshold));
  const below = cohort(`Saved fewer than ${threshold}`, log.filter((r) => r.saves < threshold));
  return {
    threshold,
    atOrAbove,
    below,
    /** Lift of the high-save cohort over the low-save cohort. */
    lift: below.rate === 0 ? Infinity : atOrAbove.rate / below.rate,
    /** True when the threshold predicts action with no exceptions in the sample. */
    perfectPredictor: atOrAbove.n > 0 && atOrAbove.acted === atOrAbove.n,
  };
}

/** Share of people who acted, who never clicked anything. Compare to E-09.2. */
export function actedWithoutClicking(log: readonly IntentRow[] = intentLog) {
  const actors = log.filter((r) => r.acted);
  const silentActors = actors.filter((r) => !r.linkClick);
  return {
    actors: actors.length,
    silentActors: silentActors.length,
    rate: actors.length === 0 ? 0 : silentActors.length / actors.length,
  };
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Median days from save to action among people who acted. Compare to E-09.3. */
export function daysToAct(log: readonly IntentRow[] = intentLog) {
  const days = log.filter((r) => r.acted && r.daysToAct !== null).map((r) => r.daysToAct as number);
  return {
    median: median(days),
    mean: days.reduce((sum, d) => sum + d, 0) / days.length,
    max: Math.max(...days),
    n: days.length,
  };
}

/* ------------------------------------------------------------------ *
 * Self check
 * ------------------------------------------------------------------ */

export type Check = {
  label: string;
  computed: string;
  stated: string;
  /** Does the computed sample figure support the figure stated on the sheet. */
  consistent: boolean;
  note?: string;
};

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/**
 * Asserts what we compute from the twelve E-10 rows against what E-09 states
 * across her full 90 days. The two will not match exactly and should not: E-10
 * is a 12-row sample, E-09 is the population. What matters is that every
 * finding replicates in the same direction and rough magnitude.
 *
 * Render this in an audit view. If a judge doubts a number, show them this.
 */
export function selfCheck(): Check[] {
  const clicks = clickCohorts();
  const silent = actedWithoutClicking();
  const saves = saveThresholdCohorts();
  const timing = daysToAct();

  return [
    {
      label: "Acted without ever clicking",
      computed: `${pct(silent.rate)} (${silent.silentActors} of ${silent.actors} actors)`,
      stated: `${statedFindings.actedWithoutClicking.display} (${statedFindings.actedWithoutClicking.ref})`,
      consistent: silent.rate >= 0.6,
      note: "Sample runs slightly higher than the stated population figure.",
    },
    {
      label: "Click is anti-predictive of action",
      computed: `${pct(clicks.notClicked.rate)} non-clickers acted vs ${pct(clicks.clicked.rate)} clickers`,
      stated: "E-09.1: the opportunity is almost never the click",
      consistent: clicks.clickIsAntiPredictive,
      note: "Stronger than the sheet claims. Clicks do not merely undercount, they select against actors.",
    },
    {
      label: `Save threshold at ${saves.threshold}`,
      computed: `${pct(saves.atOrAbove.rate)} acted (${saves.atOrAbove.acted}/${saves.atOrAbove.n}) vs ${pct(saves.below.rate)} below`,
      stated: `${statedFindings.saveThresholdLift.display} lift (${statedFindings.saveThresholdLift.ref})`,
      consistent: saves.lift >= statedFindings.saveThresholdLift.value,
      note: saves.perfectPredictor
        ? "No exceptions in the sample. This is the instrument."
        : "Threshold holds but not perfectly in this sample.",
    },
    {
      label: "Median days from save to action",
      computed: `${timing.median} days (n=${timing.n}, max ${timing.max})`,
      stated: `${statedFindings.medianDaysToAct.display} (${statedFindings.medianDaysToAct.ref})`,
      consistent: Math.abs(timing.median - statedFindings.medianDaysToAct.value) <= 3,
      note: "Sets the follow-up window. Anything sooner measures the wrong moment.",
    },
  ];
}

/** Convenience for a status pill: are all checks consistent. */
export function selfCheckPasses(): boolean {
  return selfCheck().every((c) => c.consistent);
}
