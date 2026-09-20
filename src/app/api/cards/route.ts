import { createCard, listCards, storageMode } from "@/lib/live-store";
import { requirePresenter } from "@/lib/admin";
import type { PublishedAnswer } from "@/lib/live-types";

export const dynamic = "force-dynamic";

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}

export async function GET() {
  return Response.json({ cards: await listCards(), storage: storageMode() });
}

export async function POST(request: Request) {
  const denied = requirePresenter(request);
  if (denied) return denied;
  const body = (await request.json()) as Partial<PublishedAnswer>;
  const briefId = text(body.briefId, 80);
  const question = text(body.question, 240);
  const room = text(body.room, 240);
  const decision = text(body.decision, 1_000);
  const nextStep = text(body.nextStep, 1_000);
  const criteria = Array.isArray(body.criteria)
    ? body.criteria.map((item) => text(item, 500)).filter((item): item is string => item !== null).slice(0, 8)
    : [];

  if (!briefId || !question || !room || !decision || !nextStep || criteria.length === 0) {
    return Response.json({ error: "The published answer is incomplete." }, { status: 400 });
  }

  const card = await createCard({
    briefId,
    question,
    room,
    decision,
    criteria,
    cost: text(body.cost, 1_000) ?? undefined,
    wouldDoAgain: typeof body.wouldDoAgain === "boolean" ? body.wouldDoAgain : undefined,
    nextStep,
    illustrative: body.illustrative === true,
  });
  return Response.json({ card, storage: storageMode() }, { status: 201 });
}
