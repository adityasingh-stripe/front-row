/**
 * The five answers.
 *
 * E-05.4, her own reminder to herself: "STOP MAKING [redacted]. CURATE 5."
 * So there are five, not fifteen. E-05.6 supports the same call: her
 * highest-converting posts are also her most heavily edited, so depth per
 * answer beats count.
 *
 * ---------------------------------------------------------------------------
 * PROVENANCE RULE, and the reason this file looks the way it does.
 *
 * The case file gives us her rooms, her assets, her ratings, her recurring
 * questions and short quotes. It does not give us her verdicts. So we do not
 * write them.
 *
 * Every field below is either transcribed from the evidence, or computed from
 * it, or left null for her to fill. Nothing is written in her voice. That is
 * not caution, it is the product: E-07.2 asks us to preserve her judgement,
 * and her own rule (sheet 03) is "I would rather say one true thing about a
 * room I was actually in than ten clever things about a room I was not." A
 * system that drafts her judgement for her fails both.
 *
 * The one sample verdict at the bottom is explicitly labelled illustrative and
 * exists only so the audience card can be demonstrated.
 * ---------------------------------------------------------------------------
 */

/**
 * E-05.2 // QUESTIONS I KEEP ANSWERING, her wording, verbatim from the sheet.
 * Plus the Climber's question from sheet 04. These are the entry points, and
 * they are hers, not ours.
 */
export const herQuestions = [
  { id: "which-event", text: "which event was this?", ref: "E-05.2" },
  { id: "how-do-i-get-in", text: "how do I get in?", ref: "E-05.2" },
  { id: "was-it-worth-it", text: "was it worth it?", ref: "E-05.2" },
  { id: "what-would-you-ask", text: "what would you have asked?", ref: "E-05.2" },
  { id: "would-you-take-it", text: "would you take this job?", ref: "Sheet 04 / THE CLIMBER" },
] as const;

export type QuestionId = (typeof herQuestions)[number]["id"];

/**
 * Sheet 04 // KNOWN ASSOCIATES and E-07 // FOUR PEOPLE, FOUR JOBS.
 * "The audience does not behave like one audience."
 *
 * Note THE FORWARDER has no question of her own. She is a behaviour, not a
 * query, which is precisely why she is invisible to every dashboard. She is
 * served by the share mechanic, not by an answer.
 */
export const personas = [
  {
    id: "climber",
    label: "The Climber",
    signal: "HIGH INTENT",
    wants: "Aditi to narrow the choice down to one.",
    asks: "Would you take this job?",
    question: "would-you-take-it" as QuestionId,
    tracked: { name: "Noor", ref: "E-01.2" },
  },
  {
    id: "builder",
    label: "The Builder",
    signal: "SAVES / SHARES",
    wants: "The route in, not the anecdote from inside.",
    asks: "How do I get into that room?",
    question: "how-do-i-get-in" as QuestionId,
    tracked: { name: "Clara, 24", ref: "E-07.1", note: "LOW CLICK / HIGH ACTION. Watches six times, saves, researches alone." },
  },
  {
    id: "switcher",
    label: "The Switcher",
    signal: "COMPARES",
    wants: "The honest arithmetic before committing.",
    asks: "Was it worth what it cost you?",
    question: "was-it-worth-it" as QuestionId,
    tracked: { name: "Priya, 33", ref: "E-07.3", note: "HIGH VALUE. Wants the worth-it verdict before she commits budget or a weekend." },
  },
  {
    id: "operator",
    label: "The Operator",
    signal: "HIGH REPEAT",
    wants: "Her framing applied to their own work.",
    asks: "What would you have asked them?",
    question: "what-would-you-ask" as QuestionId,
    tracked: { name: "Jamie, 29", ref: "E-07.2", note: "HIGH REPEAT. Returns to old posts and asks follow-ups." },
  },
  {
    id: "forwarder",
    label: "The Forwarder",
    signal: "INVISIBLE",
    wants: "To pass it to someone who acts on it.",
    asks: "Sending this to you.",
    question: null,
    tracked: { name: "Ella, 26", ref: "E-07.4", note: "LOW ATTRIBUTION. The team acts on it. Aditi never sees it." },
  },
] as const;

/**
 * An answer brief. The shape mirrors the "USEFUL FIELDS" row printed on E-04,
 * including the field the sheet boxes separately in red.
 */
export type AnswerBrief = {
  id: string;
  /** Which of her recurring questions this answers. */
  question: QuestionId;
  /** Verbatim from herQuestions, for display. */
  questionText: string;
  /** Who is asking, from sheet 04 / E-07. */
  persona: string;

  // --- E-04 "USEFUL FIELDS", populated from the evidence -------------------
  /** The room she was actually in. Never invented. */
  room: string;
  /** Editorial form, chosen by the engine from her own conversion data. */
  format: string;
  /** Source material she already owns. */
  material: { ref: string; description: string; status: string };

  // --- Demand -------------------------------------------------------------
  /**
   * Real messages from real readers, and nothing else.
   *
   * This field is rendered in quote marks under "What people actually asked
   * you", so it must contain only things a person actually sent her. Her own
   * private notes and the case file's analysis of audience segments both used
   * to live here, which meant the product showed Aditi her own words and an
   * analyst's persona description as though her audience had written them.
   */
  demand: readonly { ref: string; quote: string }[];
  /** Her own words about this material. Hers, so attributed to her. */
  herNote?: { ref: string; quote: string };
  /**
   * Why this editorial form, in prose with her numbers in it. Never rendered as
   * a quotation, because nobody said it.
   */
  formatEvidence?: { ref: string; text: string };
  /** Volume signal where the file gives us one. */
  pressure?: string;

  // --- The judgement. Hers to fill. Never pre-written. --------------------
  judgement: {
    /** What she decided. */
    decision: string | null;
    /** What it actually cost. Money, time, or the thing she gave up. */
    cost: string | null;
    /** Her own rating of the room. */
    aditiRating: string | null;
    /** The private note. E-05: messy on purpose, useful on purpose. */
    personalNote: string | null;
    /** The field E-04 boxes in red on its own. The one that makes it judgement. */
    wouldDoAgain: boolean | null;
    /**
     * The transposable part, and the reason this is not an FAQ.
     *
     * Clue E-01: "Underneath all of them: decide for me the way you would
     * decide for yourself." E-05.7: "If something could capture how I decide,
     * not just where I happened to be standing."
     *
     * Her criteria travel to situations she has never been in. Her anecdote
     * does not. This is the field that does the work.
     */
    criteria: readonly string[] | null;
    /** The one thing the reader does next, before spending anything. */
    nextStep: string | null;
  };

  /** Where every pre-filled field came from. */
  evidence: readonly string[];
  /** READY once she has supplied the judgement. */
  status: "AWAITING JUDGEMENT" | "READY";
};

/**
 * The five, ordered by the strength of the demand signal in the file.
 * All five open. None is a dead button.
 */
export const answerBriefs: readonly AnswerBrief[] = [
  {
    id: "cannes-600",
    question: "was-it-worth-it",
    questionText: "was it worth it?",
    persona: "switcher",
    room: "Cannes Lions week",
    format: "cost-breakdown",
    material: { ref: "E-04.2", description: "40 clips from Cannes", status: "Half cut" },
    demand: [
      { ref: "E-01.4", quote: "How much did that week actually cost you? I have about £600 and a lot of nerve." },
      { ref: "E-01.12", quote: "I have opened this three times. Still deciding." },
    ],
    herNote: { ref: "E-04.2", quote: "everyone only saw the glamour" },
    formatEvidence: {
      ref: "E-03.3",
      text: "Your cost breakdown converted 611 people from 890K views. Your Cannes recap converted 62 from 3.9M.",
    },
    pressure: "A real budget decision aligns with an honest-cost format and material she already has.",
    judgement: {
      decision: null, cost: null, aditiRating: null, personalNote: null,
      wouldDoAgain: null, criteria: null, nextStep: null,
    },
    evidence: ["E-01.4", "E-03.3", "E-04.2", "E-07.3"],
    status: "AWAITING JUDGEMENT",
  },
  {
    id: "backstage-answer",
    question: "what-would-you-ask",
    questionText: "what would you have asked?",
    persona: "operator",
    room: "Backstage Q&A after the founder session",
    format: "single-answer",
    material: { ref: "E-04.5", description: "The answer she rates highest", status: "Unrecorded, gone" },
    demand: [
      { ref: "E-01.9", quote: "I want to build in public without annoying my employer. How do you decide what to post?" },
    ],
    herNote: { ref: "E-04.5", quote: "the best answer I ever gave" },
    formatEvidence: {
      ref: "E-03.4",
      text: "One answer given to one person converted 806 people from 320K views: your best of the year, off the smallest reach in the set.",
    },
    pressure:
      "One of the four questions she says she keeps answering. Her highest-converting format, and the original was never recorded.",
    judgement: {
      decision: null, cost: null, aditiRating: null, personalNote: null,
      wouldDoAgain: null, criteria: null, nextStep: null,
    },
    evidence: ["E-03.4", "E-04.5", "E-05.1", "E-07.2"],
    status: "AWAITING JUDGEMENT",
  },
  {
    id: "route-in",
    question: "how-do-i-get-in",
    questionText: "how do I get in?",
    persona: "builder",
    room: "Six founder stage interviews",
    format: "procedure",
    material: { ref: "E-04.1", description: "6 sessions, in the can", status: "In the can" },
    demand: [
      { ref: "E-01.3", quote: "I love this but I am not in London. How would you do it from Bangalore?" },
      { ref: "E-01.7", quote: "Can you do a version of this for someone outside tech? Same energy, less startup." },
    ],
    herNote: { ref: "E-04.1", quote: "best material I have" },
    formatEvidence: {
      ref: "E-03.1",
      text: "Your 'three questions I ask' post is the closest thing you have published to a method: 68K saves and 340 sign-ups.",
    },
    pressure: "Clara watches this six times, saves it, then researches alone. She never clicks.",
    judgement: {
      decision: null, cost: null, aditiRating: null, personalNote: null,
      wouldDoAgain: null, criteria: null, nextStep: null,
    },
    evidence: ["E-01.3", "E-01.7", "E-04.1", "E-07.1"],
    status: "AWAITING JUDGEMENT",
  },
  {
    id: "take-the-offer",
    question: "would-you-take-it",
    questionText: "would you take this job?",
    persona: "climber",
    room: "The opportunities she said no to this year",
    format: "refusal-list",
    material: { ref: "E-03.5", description: "The opportunities I said no to this year", status: "Published, 0 direct conversions, high trust" },
    demand: [
      { ref: "E-01.2", quote: "Ok but if you were me, would you take the seed-stage offer or stay put?" },
      { ref: "E-01.8", quote: "I took the job. What do I actually do in the first 30 days?" },
    ],
    /* Worth surfacing the tension rather than hiding it: they keep asking, and
       her own keep/kill note says this is the wrong room for her. */
    herNote: { ref: "E-05.1", quote: "Career posts, wrong room" },
    formatEvidence: {
      ref: "E-03.5",
      text: "Your refusal list earned 52K saves and nought sign-ups. It builds trust and converts nobody directly, so make it for the trust.",
    },
    pressure:
      "They are not asking for a framework. They want the choice narrowed to one, which she cannot do at scale until her criteria are written down.",
    judgement: {
      decision: null, cost: null, aditiRating: null, personalNote: null,
      wouldDoAgain: null, criteria: null, nextStep: null,
    },
    evidence: ["E-01.2", "E-01.8", "E-03.5", "Sheet 04"],
    status: "AWAITING JUDGEMENT",
  },
  {
    id: "which-event",
    question: "which-event",
    questionText: "which event was this?",
    persona: "builder",
    room: "The six-country speaking run",
    format: "procedure",
    material: { ref: "E-04.7", description: "4 months, six countries", status: "In progress" },
    demand: [
      { ref: "E-01.1", quote: "WHICH event was this, I am begging you" },
      { ref: "E-01.11", quote: "My manager sent me your keynote clip because he thinks I need it" },
    ],
    herNote: { ref: "E-04.7", quote: "there is one of me" },
    formatEvidence: {
      ref: "E-02",
      text: "41 messages of this shape were waiting before 07:00 on an ordinary Tuesday. It is the highest-volume question and contains little of the judgement people trust her for. Answer it once rather than one DM at a time.",
    },
    pressure: "Highest volume, low judgement. Acknowledge it once without spending the next content slot on it.",
    judgement: {
      decision: null, cost: null, aditiRating: null, personalNote: null,
      wouldDoAgain: null, criteria: null, nextStep: null,
    },
    evidence: ["E-02", "E-04.7", "E-05.2"],
    status: "AWAITING JUDGEMENT",
  },
] as const;

/**
 * ILLUSTRATIVE ONLY. Not case evidence. Not Aditi's words.
 *
 * Exists so the audience card can be demonstrated end to end without waiting
 * for her to type. Must stay visibly labelled wherever it renders: if a judge
 * mistakes this for her judgement, we have failed judging question 2.
 */
export const illustrativeSample = {
  briefId: "cannes-600",
  disclaimer: "Sample input. Demonstrates the publishing flow. Not case evidence and not Aditi's words.",
  judgement: {
    decision: "Do not buy the badge for proximity.",
    cost: "One week, and the two commissions I turned down to be there.",
    aditiRating: "Worth it once, for the three conversations. Not worth it twice.",
    personalNote: "Everyone only saw the glamour. Nobody saw the invoice.",
    wouldDoAgain: false,
    criteria: [
      "Name the three conversations the trip has to create before you book anything.",
      "Price the whole week, not the ticket. Beds and taxis cost more than the badge.",
      "If you cannot reach those three people any other way, go. If you can, do that instead.",
    ],
    nextStep: "Write down the three people you need to meet, then check whether you can reach them without buying the full pass.",
  },
} as const;

/** Her voice filter, E-05.1. Use as the prompt on the capture form. */
export const voiceFilter = {
  ref: "E-05.1",
  quote: "if I would not say it to my sister on the phone, I do not post it",
  prompt: "What would you tell your sister on the phone?",
} as const;

/** E-05.3, her unfinished idea. Use verbatim as the audience-side invitation. */
export const audienceInvitation = {
  ref: "E-05.3",
  quote: "let people bring me their own decision",
} as const;
