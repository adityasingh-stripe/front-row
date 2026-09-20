import { cardSummary, getCard, storageMode } from "@/lib/live-store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext<"/api/cards/[cardId]">) {
  const { cardId } = await context.params;
  const card = await getCard(cardId);
  if (!card) return Response.json({ error: "Answer not found." }, { status: 404 });
  return Response.json({ card, summary: await cardSummary(cardId), storage: storageMode() });
}
