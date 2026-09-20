import assert from "node:assert/strict";
import test from "node:test";
import { editorialQueue } from "../src/lib/editorial";
import { summariseEvents } from "../src/lib/events";
import type { AudienceEvent, CreatorNote } from "../src/lib/live-types";

const event = (
  input: Pick<AudienceEvent, "id" | "type" | "visitorId"> & Partial<AudienceEvent>,
): AudienceEvent => ({
  cardId: "fr_test",
  createdAt: "2026-09-20T12:00:00.000Z",
  ...input,
});

test("summarises only recorded saves, forwards, attribution and outcomes", () => {
  const summary = summariseEvents([
    event({ id: "evt_1", type: "forward", visitorId: "v1" }),
    event({ id: "evt_2", type: "save", visitorId: "v2", via: "evt_1" }),
    event({ id: "evt_3", type: "save", visitorId: "v3" }),
    event({ id: "evt_4", type: "outcome", visitorId: "v2", outcome: "acted" }),
    event({ id: "evt_5", type: "outcome", visitorId: "v3", outcome: "did-not", blocker: "cost" }),
  ]);

  assert.deepEqual(summary, {
    saves: 2,
    forwards: 1,
    attributedSaves: 1,
    outcomes: { acted: 1, stillDeciding: 0, didNot: 1 },
  });
});

test("capturing Aditi's note changes readiness without fabricating demand", () => {
  const before = editorialQueue([]);
  assert.equal(before[0].brief.id, "cannes-600");
  assert.equal(before[0].action, "capture");

  const note: CreatorNote = {
    briefId: "cannes-600",
    room: "Cannes Lions week",
    insight: "everyone only saw the glamour",
    material: "40 clips from Cannes",
    cost: "One week",
    wouldDoAgain: false,
    updatedAt: "2026-09-20T12:00:00.000Z",
  };
  const after = editorialQueue([note]);
  assert.equal(after[0].brief.id, "cannes-600");
  assert.equal(after[0].action, "publish");
  assert.match(after[0].demandSignal, /£600/);
});
