import { emptySummary, type AudienceEvent, type CardSummary } from "./live-types";

export function summariseEvents(events: readonly AudienceEvent[]): CardSummary {
  return events.reduce<CardSummary>(
    (summary, event) => {
      if (event.type === "save") {
        summary.saves += 1;
        if (event.via) summary.attributedSaves += 1;
      }
      if (event.type === "forward") summary.forwards += 1;
      if (event.type === "outcome" && event.outcome === "acted") summary.outcomes.acted += 1;
      if (event.type === "outcome" && event.outcome === "still-deciding") {
        summary.outcomes.stillDeciding += 1;
      }
      if (event.type === "outcome" && event.outcome === "did-not") summary.outcomes.didNot += 1;
      return summary;
    },
    structuredClone(emptySummary),
  );
}
