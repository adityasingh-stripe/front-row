/**
 * E-10 // WHAT HAPPENS BEFORE THE DECISION
 * Sheet 14/16, ref FRW-003-E10. Intent data released at 16:00.
 *
 * Transcribed verbatim from the case file. Twelve rows, no additions.
 * The sheet's own instruction: "The YES/NO around link clicks is intentionally
 * incomplete. You are supposed to decide what matters, then decide what to
 * instrument. Signal can be behavioural rather than transactional."
 *
 * This is the only row-level dataset in the entire case file. Everything the
 * dashboard claims about cohorts is computed from it in ../engine.ts, never
 * hardcoded.
 */

export type IntentRow = {
  /** Anonymised user ref as printed on the sheet. */
  user: string;
  saves: number;
  shares: number;
  returns: number;
  /** Did they click a link in the post. */
  linkClick: boolean;
  /** Did they take the action. */
  acted: boolean;
  /** Days between saving and acting. null where they never acted ("–" on the sheet). */
  daysToAct: number | null;
  /** The sheet bolds the saves figure for these two rows. */
  emphasised?: true;
};

export const intentLog: readonly IntentRow[] = [
  { user: "U-014", saves: 7, shares: 2, returns: 4, linkClick: false, acted: true, daysToAct: 11 },
  { user: "U-031", saves: 2, shares: 0, returns: 1, linkClick: true, acted: true, daysToAct: 0.6 },
  { user: "U-067", saves: 5, shares: 3, returns: 3, linkClick: false, acted: true, daysToAct: 8 },
  { user: "U-082", saves: 1, shares: 0, returns: 1, linkClick: true, acted: false, daysToAct: null },
  { user: "U-104", saves: 9, shares: 5, returns: 6, linkClick: false, acted: true, daysToAct: 14, emphasised: true },
  { user: "U-121", saves: 3, shares: 1, returns: 2, linkClick: false, acted: true, daysToAct: 5 },
  { user: "U-139", saves: 6, shares: 4, returns: 3, linkClick: false, acted: true, daysToAct: 7 },
  { user: "U-166", saves: 1, shares: 0, returns: 1, linkClick: true, acted: false, daysToAct: null },
  { user: "U-204", saves: 11, shares: 6, returns: 7, linkClick: false, acted: true, daysToAct: 16, emphasised: true },
  { user: "U-219", saves: 4, shares: 0, returns: 2, linkClick: true, acted: true, daysToAct: 2 },
  { user: "U-241", saves: 2, shares: 2, returns: 2, linkClick: false, acted: false, daysToAct: null },
  { user: "U-288", saves: 7, shares: 4, returns: 5, linkClick: false, acted: true, daysToAct: 9 },
] as const;

/**
 * E-09 // THE OPPORTUNITY IS ALMOST NEVER THE CLICK
 * Sheet 13/16. The four figures stated on the sheet, across her full 90 days.
 * We keep them separate from the computed figures so the dashboard can show
 * "stated on the sheet" against "computed from the sample" without conflating them.
 */
export const statedFindings = {
  actedWithoutClicking: {
    ref: "E-09.2",
    value: 0.71,
    display: "71%",
    claim: "of people who acted on her advice never clicked a link in the post",
  },
  medianDaysToAct: {
    ref: "E-09.3",
    value: 9.2,
    display: "9.2 days",
    claim: "median time between saving Aditi's content and taking the action",
  },
  inboundViaForward: {
    ref: "E-09.4",
    value: 0.44,
    display: "44%",
    claim: "of her highest-value inbound arrived through a forward rather than a follow",
  },
  /**
   * The sharpest of the four and the one most easily missed: it is a threshold
   * effect, not a linear one. In the E-10 sample, saves >= 3 predicts action
   * with no exceptions (8 of 8). This is the figure the instrument is built on.
   */
  saveThresholdLift: {
    ref: "E-09.5",
    value: 3.1,
    display: "3.1x",
    claim: "higher action rate when a person saved three or more posts before deciding",
    threshold: 3,
  },
} as const;
