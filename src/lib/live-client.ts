import type {
  AudienceEvent,
  CardSummary,
  CreatorNote,
  PublishedAnswer,
} from "./live-types";

async function json<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Front Row could not complete that request.");
  return body;
}

export async function createPublishedAnswer(
  answer: Omit<PublishedAnswer, "id" | "createdAt">,
): Promise<PublishedAnswer> {
  const result = await json<{ card: PublishedAnswer }>(
    await fetch("/api/cards", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(answer),
    }),
  );
  return result.card;
}

export async function getPublishedAnswer(cardId: string) {
  return json<{ card: PublishedAnswer; summary: CardSummary }>(
    await fetch(`/api/cards/${encodeURIComponent(cardId)}`, { cache: "no-store" }),
  );
}

export async function getPublishedAnswers(): Promise<PublishedAnswer[]> {
  const result = await json<{ cards: PublishedAnswer[] }>(
    await fetch("/api/cards", { cache: "no-store" }),
  );
  return result.cards;
}

export async function recordAudienceEvent(
  cardId: string,
  event: Pick<AudienceEvent, "type" | "visitorId" | "via" | "outcome" | "blocker">,
) {
  return json<{ event: AudienceEvent; duplicate: boolean; summary: CardSummary }>(
    await fetch(`/api/cards/${encodeURIComponent(cardId)}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    }),
  );
}

export async function getNotes(): Promise<CreatorNote[]> {
  const result = await json<{ notes: CreatorNote[] }>(
    await fetch("/api/notes", { cache: "no-store" }),
  );
  return result.notes;
}

export async function saveNote(
  note: Omit<CreatorNote, "updatedAt">,
): Promise<CreatorNote> {
  const result = await json<{ note: CreatorNote }>(
    await fetch("/api/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(note),
    }),
  );
  return result.note;
}

export function audienceUrl(cardId: string, via?: string): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const query = via ? `?via=${encodeURIComponent(via)}` : "";
  return `${origin}/a/${encodeURIComponent(cardId)}${query}`;
}

export function visitorId(): string {
  const key = "front-row-visitor";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = `visitor_${crypto.randomUUID()}`;
  window.localStorage.setItem(key, created);
  return created;
}

export async function shareLink(url: string, text: string): Promise<"copied" | "shared" | "failed"> {
  try {
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      await navigator.share({ title: "Aditi Mishra", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
