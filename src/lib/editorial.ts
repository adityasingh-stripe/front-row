import { answerBriefs, type AnswerBrief } from "./answers";
import type { CreatorNote } from "./live-types";

export type EditorialCandidate = {
  brief: AnswerBrief;
  rank: number;
  recommendation: string;
  demandSignal: string;
  formatSignal: string;
  materialSignal: string;
  action: "publish" | "capture" | "reconstruct" | "acknowledge";
  holdingReply: string;
};

const editorialOrder = [
  "cannes-600",
  "route-in",
  "backstage-answer",
  "take-the-offer",
  "which-event",
] as const;

const reasoning: Record<
  (typeof editorialOrder)[number],
  Omit<EditorialCandidate, "brief" | "rank" | "action">
> = {
  "cannes-600": {
    recommendation: "Tell the honest cost of Cannes, not the glamour recap.",
    demandSignal: "A reader has £600 and needs a verdict. Another returned to the post three times.",
    formatSignal: "The cost breakdown earned 74K saves and 611 sign-ups. The recap reached 3.9M and earned 62.",
    materialSignal: "Forty Cannes clips already exist and are half cut.",
    holdingReply: "A lot of you have asked what that week really cost. I am making this next.",
  },
  "route-in": {
    recommendation: "Turn the founder interviews into the route into the room.",
    demandSignal: "Readers asked for a route that works outside London and outside tech.",
    formatSignal: "Her closest published method earned 68K saves.",
    materialSignal: "Six founder sessions are already in the can.",
    holdingReply: "I have seen the questions about how to get into the room. I am working on the route, not another recap.",
  },
  "backstage-answer": {
    recommendation: "Reconstruct the backstage answer before it disappears again.",
    demandSignal: "Operators keep asking for her framing, not another event summary.",
    formatSignal: "One backstage answer is her best-converting format in the issued evidence.",
    materialSignal: "The original answer was not recorded, so this needs reconstruction rather than editing.",
    holdingReply: "A few of you asked what I would have asked in that room. I am reconstructing the answer.",
  },
  "take-the-offer": {
    recommendation: "Publish the criteria behind the opportunities she declined.",
    demandSignal: "Readers want her to narrow a real career choice to one.",
    formatSignal: "The refusal post earned 52K saves. It is a trust format, not a direct-conversion format.",
    materialSignal: "The source post already exists, but her note says career posts can be the wrong room.",
    holdingReply: "I have seen the job-choice questions. I am writing the criteria I use, not choosing on your behalf in a DM.",
  },
  "which-event": {
    recommendation: "Answer the event question once. Do not spend the next content slot on it.",
    demandSignal: "Forty-one messages of this shape were waiting before 07:00.",
    formatSignal: "It is the loudest question, but the evidence does not show that it creates the deepest intent.",
    materialSignal: "The six-country speaking run is still in progress.",
    holdingReply: "This was part of the six-country speaking run. I will collect the route and details in one place.",
  },
};

export function editorialQueue(notes: readonly CreatorNote[]): EditorialCandidate[] {
  const noteIds = new Set(notes.map((note) => note.briefId));
  return editorialOrder.map((id, index) => {
    const brief = answerBriefs.find((item) => item.id === id);
    if (!brief) throw new Error(`Missing answer brief: ${id}`);
    const action: EditorialCandidate["action"] = noteIds.has(id)
      ? "publish"
      : id === "backstage-answer"
        ? "reconstruct"
        : id === "which-event"
          ? "acknowledge"
          : "capture";
    return { brief, rank: index + 1, action, ...reasoning[id] };
  });
}
