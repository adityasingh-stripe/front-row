import type { Blocker } from "./evidence/decision-log";

export type CreatorNote = {
  briefId: string;
  room: string;
  insight: string;
  cost: string;
  material: string;
  wouldDoAgain: boolean | null;
  updatedAt: string;
};

export type PublishedAnswer = {
  id: string;
  briefId: string;
  question: string;
  room: string;
  decision: string;
  criteria: string[];
  cost?: string;
  wouldDoAgain?: boolean;
  nextStep: string;
  illustrative: boolean;
  createdAt: string;
};

export type AudienceEvent = {
  id: string;
  cardId: string;
  type: "save" | "forward" | "outcome";
  visitorId: string;
  via?: string;
  outcome?: "acted" | "still-deciding" | "did-not";
  blocker?: Blocker;
  createdAt: string;
};

export type CardSummary = {
  saves: number;
  forwards: number;
  attributedSaves: number;
  outcomes: {
    acted: number;
    stillDeciding: number;
    didNot: number;
  };
};

export const emptySummary: CardSummary = {
  saves: 0,
  forwards: 0,
  attributedSaves: 0,
  outcomes: { acted: 0, stillDeciding: 0, didNot: 0 },
};
