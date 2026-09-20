import "server-only";

import { randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import { summariseEvents } from "./events";
import type { AudienceEvent, CardSummary, CreatorNote, PublishedAnswer } from "./live-types";

const PREFIX = "front-row:v1";

type MemoryStore = {
  cards: Map<string, PublishedAnswer>;
  cardOrder: string[];
  events: Map<string, AudienceEvent[]>;
  dedupe: Set<string>;
  notes: Map<string, CreatorNote>;
};

declare global {
  var __frontRowMemoryStore: MemoryStore | undefined;
}

function memoryStore(): MemoryStore {
  if (!globalThis.__frontRowMemoryStore) {
    globalThis.__frontRowMemoryStore = {
      cards: new Map(),
      cardOrder: [],
      events: new Map(),
      dedupe: new Set(),
      notes: new Map(),
    };
  }
  return globalThis.__frontRowMemoryStore;
}

function redis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === "production" && process.env.FRONT_ROW_LOCAL_STORE !== "1") {
      throw new Error("Upstash is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
    }
    return null;
  }
  return Redis.fromEnv();
}

export function storageMode(): "upstash" | "local-development" {
  return process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? "upstash"
    : "local-development";
}

export async function createCard(
  input: Omit<PublishedAnswer, "id" | "createdAt">,
): Promise<PublishedAnswer> {
  const card: PublishedAnswer = {
    ...input,
    id: `fr_${randomUUID().replaceAll("-", "").slice(0, 16)}`,
    createdAt: new Date().toISOString(),
  };
  const client = redis();

  if (client) {
    await client.set(`${PREFIX}:card:${card.id}`, card);
    await client.lpush(`${PREFIX}:cards`, card.id);
    await client.ltrim(`${PREFIX}:cards`, 0, 49);
  } else {
    const store = memoryStore();
    store.cards.set(card.id, card);
    store.cardOrder = [card.id, ...store.cardOrder.filter((id) => id !== card.id)].slice(0, 50);
  }
  return card;
}

export async function getCard(id: string): Promise<PublishedAnswer | null> {
  const client = redis();
  if (client) return client.get<PublishedAnswer>(`${PREFIX}:card:${id}`);
  return memoryStore().cards.get(id) ?? null;
}

export async function listCards(): Promise<PublishedAnswer[]> {
  const client = redis();
  if (client) {
    const ids = await client.lrange<string>(`${PREFIX}:cards`, 0, 49);
    if (ids.length === 0) return [];
    const cards = await client.mget<(PublishedAnswer | null)[]>(...ids.map((id) => `${PREFIX}:card:${id}`));
    return cards.filter((card): card is PublishedAnswer => card !== null);
  }
  const store = memoryStore();
  return store.cardOrder.flatMap((id) => {
    const card = store.cards.get(id);
    return card ? [card] : [];
  });
}

export async function recordEvent(
  cardId: string,
  input: Omit<AudienceEvent, "id" | "cardId" | "createdAt">,
): Promise<{ event: AudienceEvent; duplicate: boolean }> {
  const event: AudienceEvent = {
    ...input,
    id: `evt_${randomUUID().replaceAll("-", "").slice(0, 16)}`,
    cardId,
    createdAt: new Date().toISOString(),
  };
  const dedupeKey = `${PREFIX}:dedupe:${cardId}:${input.visitorId}:${input.type}`;
  const client = redis();

  if (client) {
    const accepted = await client.set(dedupeKey, event.id, { nx: true });
    if (accepted === null) {
      const events = await listEvents(cardId);
      const existing = events.find(
        (item) => item.visitorId === input.visitorId && item.type === input.type,
      );
      return { event: existing ?? event, duplicate: true };
    }
    await client.lpush(`${PREFIX}:events:${cardId}`, event);
  } else {
    const store = memoryStore();
    if (store.dedupe.has(dedupeKey)) {
      const existing = (store.events.get(cardId) ?? []).find(
        (item) => item.visitorId === input.visitorId && item.type === input.type,
      );
      return { event: existing ?? event, duplicate: true };
    }
    store.dedupe.add(dedupeKey);
    store.events.set(cardId, [event, ...(store.events.get(cardId) ?? [])]);
  }
  return { event, duplicate: false };
}

export async function listEvents(cardId: string): Promise<AudienceEvent[]> {
  const client = redis();
  if (client) return client.lrange<AudienceEvent>(`${PREFIX}:events:${cardId}`, 0, 499);
  return memoryStore().events.get(cardId) ?? [];
}

export async function cardSummary(cardId: string): Promise<CardSummary> {
  return summariseEvents(await listEvents(cardId));
}

export async function putNote(input: Omit<CreatorNote, "updatedAt">): Promise<CreatorNote> {
  const note = { ...input, updatedAt: new Date().toISOString() };
  const client = redis();
  if (client) await client.set(`${PREFIX}:note:${note.briefId}`, note);
  else memoryStore().notes.set(note.briefId, note);
  return note;
}

export async function listNotes(): Promise<CreatorNote[]> {
  const client = redis();
  if (client) {
    const keys = await client.keys(`${PREFIX}:note:*`);
    if (keys.length === 0) return [];
    const notes = await client.mget<(CreatorNote | null)[]>(...keys);
    return notes.filter((note): note is CreatorNote => note !== null);
  }
  return [...memoryStore().notes.values()];
}
