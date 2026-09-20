import { answerBriefs } from "@/lib/answers";
import { requireCreatorWorkspace } from "@/lib/admin";
import { listNotes, putNote, storageMode } from "@/lib/live-store";
import type { CreatorNote } from "@/lib/live-types";

export const dynamic = "force-dynamic";

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}

export async function GET(request: Request) {
  const denied = requireCreatorWorkspace(request);
  if (denied) return denied;
  return Response.json({ notes: await listNotes(), storage: storageMode() });
}

export async function POST(request: Request) {
  const denied = requireCreatorWorkspace(request);
  if (denied) return denied;
  const body = (await request.json()) as Partial<CreatorNote>;
  const briefId = clean(body.briefId, 80);
  const room = clean(body.room, 240);
  const insight = clean(body.insight, 1_000);
  const material = clean(body.material, 500);
  if (!briefId || !answerBriefs.some((brief) => brief.id === briefId) || !room || !insight || !material) {
    return Response.json({ error: "The room, insight and material are required." }, { status: 400 });
  }
  const note = await putNote({
    briefId,
    room,
    insight,
    material,
    cost: typeof body.cost === "string" ? body.cost.trim().slice(0, 1_000) : "",
    wouldDoAgain: typeof body.wouldDoAgain === "boolean" ? body.wouldDoAgain : null,
  });
  return Response.json({ note, storage: storageMode() }, { status: 201 });
}
