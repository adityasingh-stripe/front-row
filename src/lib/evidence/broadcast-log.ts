/**
 * E-03 // BROADCAST LOG
 * Sheet 07/16, ref FRW-003-E03. "The posts that matter. Reach is loud. Intent is quiet."
 *
 * All five posts, transcribed verbatim including the saves column, which is the
 * column that matters and the one easiest to drop. Clue E-03: "The most-watched
 * post is not the strongest commercial signal. Read the behaviour, not the
 * vanity metric."
 *
 * Ranked by views, this list is in one order. Ranked by observed intent, that
 * order changes materially. The audit view renders both signals.
 */

export type BroadcastPost = {
  ref: string;
  title: string;
  views: number;
  saves: number;
  /** Direct sign-ups attributed to the post. */
  signups: number;
  /** The verdict printed on the sheet, in the sheet's own words. */
  sheetVerdict: string;
  /**
   * Our own classification of the editorial form. Not on the sheet.
   * Used by the engine to recommend a format, not just a topic.
   */
  format: "single-answer" | "cost-breakdown" | "procedure" | "recap" | "refusal-list";
};

export const broadcastLog: readonly BroadcastPost[] = [
  {
    ref: "E-03.1",
    title: "The three questions I ask before I post anything",
    views: 1_400_000,
    saves: 68_000,
    signups: 340,
    sheetVerdict: "Strong conversion",
    format: "procedure",
  },
  {
    ref: "E-03.2",
    title: "Everything I saw at Cannes Lions",
    views: 3_900_000,
    saves: 41_000,
    signups: 62,
    sheetVerdict: "High reach, low intent",
    format: "recap",
  },
  {
    ref: "E-03.3",
    title: "What that week actually cost me",
    views: 890_000,
    saves: 74_000,
    signups: 611,
    sheetVerdict: "High intent",
    format: "cost-breakdown",
  },
  {
    ref: "E-03.4",
    title: "The answer I gave a founder backstage",
    views: 320_000,
    saves: 29_000,
    signups: 806,
    sheetVerdict: "Quiet winner",
    format: "single-answer",
  },
  {
    ref: "E-03.5",
    title: "The opportunities I said no to this year",
    views: 1_100_000,
    saves: 52_000,
    signups: 0,
    sheetVerdict: "High trust, low direct revenue",
    format: "refusal-list",
  },
] as const;

/**
 * E-04 // INVENTORY, THE ACCESS LEDGER
 * Sheet 08/16. "Extract: 8 of 61 assets. Being in the room is not the same
 * thing as an answer." Her own words in the right-hand column, verbatim.
 *
 * The sheet's "USEFUL FIELDS" row hands us the schema: Room, Format, Decision,
 * Cost, Aditi rating, Personal note, and separately boxed in red:
 * "Would I do it again?" That schema is used in ../answers.ts.
 */

export type LedgerAsset = {
  ref: string;
  asset: string;
  type: "Video" | "Talk" | "Audio" | "Live" | "Text" | "Access";
  volume: string;
  status: "In the can" | "Half cut" | "Used once" | "Unfiled" | "Gone" | "Dormant" | "In progress" | "Unsorted";
  /** Her words, exactly as printed. */
  aditiSays: string;
};

export const accessLedger: readonly LedgerAsset[] = [
  { ref: "E-04.1", asset: "Founder stage interviews", type: "Video", volume: "6 sessions", status: "In the can", aditiSays: "best material I have" },
  { ref: "E-04.2", asset: "Cannes Lions week", type: "Video", volume: "40 clips", status: "Half cut", aditiSays: "everyone only saw the glamour" },
  { ref: "E-04.3", asset: "Keynote, 300 in the room", type: "Talk", volume: "32 min", status: "Used once", aditiSays: "should have been ten things" },
  { ref: "E-04.4", asset: "Walk-home voice notes", type: "Audio", volume: "9 hrs", status: "Unfiled", aditiSays: "where the real thinking is" },
  { ref: "E-04.5", asset: "Backstage Q&A", type: "Live", volume: "Unrecorded", status: "Gone", aditiSays: "the best answer I ever gave" },
  { ref: "E-04.6", asset: "Newsletter archive", type: "Text", volume: "42K list", status: "Dormant", aditiSays: "I lost the thread" },
  { ref: "E-04.7", asset: "Six-country speaking run", type: "Access", volume: "4 months", status: "In progress", aditiSays: "there is one of me" },
  { ref: "E-04.8", asset: "Reader replies", type: "Text", volume: "2.6K / mo", status: "Unsorted", aditiSays: "the actual research" },
] as const;

/**
 * The two rows that matter most when read together:
 *
 * E-04.5 is "the best answer I ever gave", unrecorded and gone.
 * E-03.4 is a retelling of a backstage answer, and it is her highest-converting
 * post of the year by a factor of 3.6 on the next best.
 *
 * Her best-performing format is one answer given to one person. The original was
 * never captured. That is the entire product thesis, and it is in her own file.
 */
export const thesis = {
  lostAsset: "E-04.5",
  provenPost: "E-03.4",
  herWords: "Backstage answers, make once, keep forever.",
  herWordsRef: "E-05.1",
} as const;
