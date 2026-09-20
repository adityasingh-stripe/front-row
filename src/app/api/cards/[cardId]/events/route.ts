import { blockers } from "@/lib/evidence/decision-log";
import { cardSummary, getCard, recordEvent } from "@/lib/live-store";
import type { AudienceEvent } from "@/lib/live-types";

export const dynamic = "force-dynamic";

const eventTypes = new Set<AudienceEvent["type"]>(["save", "forward", "outcome"]);
const outcomes = new Set<NonNullable<AudienceEvent["outcome"]>>([
  "acted",
  "still-deciding",
  "did-not",
]);
const blockerIds = new Set(blockers.map((item) => item.id));

export async function GET(_request: Request, context: RouteContext<"/api/cards/[cardId]/events">) {
  const { cardId } = await context.params;
  if (!(await getCard(cardId))) return Response.json({ error: "Answer not found." }, { status: 404 });
  return Response.json({ summary: await cardSummary(cardId) });
}

export async function POST(request: Request, context: RouteContext<"/api/cards/[cardId]/events">) {
  const { cardId } = await context.params;
  if (!(await getCard(cardId))) return Response.json({ error: "Answer not found." }, { status: 404 });

  const body = (await request.json()) as Partial<AudienceEvent>;
  if (!body.type || !eventTypes.has(body.type) || typeof body.visitorId !== "string" || body.visitorId.length > 100) {
    return Response.json({ error: "Invalid audience event." }, { status: 400 });
  }
  if (body.type === "outcome" && (!body.outcome || !outcomes.has(body.outcome))) {
    return Response.json({ error: "An outcome is required." }, { status: 400 });
  }
  if (
    body.blocker &&
    !blockerIds.has(body.blocker as (typeof blockers)[number]["id"])
  ) {
    return Response.json({ error: "Invalid blocker." }, { status: 400 });
  }

  const result = await recordEvent(cardId, {
    type: body.type,
    visitorId: body.visitorId,
    via: typeof body.via === "string" && body.via.length <= 100 ? body.via : undefined,
    outcome: body.type === "outcome" ? body.outcome : undefined,
    blocker: body.type === "outcome" ? body.blocker : undefined,
  });
  return Response.json({ ...result, summary: await cardSummary(cardId) }, { status: result.duplicate ? 200 : 201 });
}
