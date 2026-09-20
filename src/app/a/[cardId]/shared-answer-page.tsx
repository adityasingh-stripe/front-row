"use client";

import { useEffect, useState } from "react";
import { blockers, type Blocker } from "@/lib/evidence/decision-log";
import {
  audienceUrl,
  getPublishedAnswer,
  recordAudienceEvent,
  shareLink,
  visitorId,
} from "@/lib/live-client";
import type { PublishedAnswer } from "@/lib/live-types";
import { sentenceCase } from "@/lib/text";
import { Pill } from "@/components/parts";

type Outcome = "acted" | "still-deciding" | "did-not";

export default function SharedAnswerPage({ cardId }: { cardId: string }) {
  const [answer, setAnswer] = useState<PublishedAnswer | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "empty">("loading");
  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [blocker, setBlocker] = useState<Blocker | null>(null);
  const [outcomeSent, setOutcomeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublishedAnswer(cardId)
      .then(({ card }) => {
        setAnswer(card);
        setSaved(window.localStorage.getItem(`front-row-saved:${cardId}`) === "yes");
        setOutcomeSent(window.localStorage.getItem(`front-row-outcome:${cardId}`) === "yes");
        setState("ready");
      })
      .catch(() => setState("empty"));
  }, [cardId]);

  const via =
    typeof window === "undefined"
      ? undefined
      : new URLSearchParams(window.location.search).get("via") ?? undefined;

  const save = async () => {
    if (saved) return;
    setError(null);
    try {
      await recordAudienceEvent(cardId, { type: "save", visitorId: visitorId(), via });
      window.localStorage.setItem(`front-row-saved:${cardId}`, "yes");
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The save could not be recorded.");
    }
  };

  const forward = async () => {
    if (!answer) return;
    setError(null);
    try {
      const result = await recordAudienceEvent(cardId, {
        type: "forward",
        visitorId: visitorId(),
        via,
      });
      setShareState(await shareLink(audienceUrl(cardId, result.event.id), answer.decision));
    } catch (reason) {
      setShareState("failed");
      setError(reason instanceof Error ? reason.message : "The forward could not be recorded.");
    }
  };

  const sendOutcome = async () => {
    if (!outcome || ((outcome === "still-deciding" || outcome === "did-not") && !blocker)) return;
    setError(null);
    try {
      await recordAudienceEvent(cardId, {
        type: "outcome",
        visitorId: visitorId(),
        via,
        outcome,
        blocker: outcome === "acted" ? undefined : blocker ?? undefined,
      });
      window.localStorage.setItem(`front-row-outcome:${cardId}`, "yes");
      setOutcomeSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The outcome could not be recorded.");
    }
  };

  if (state === "loading") return <Shell><p className="text-sm text-muted">Opening…</p></Shell>;
  if (state === "empty" || !answer) {
    return (
      <Shell>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">Answer unavailable</p>
        <h1 className="mt-3 text-[1.5rem] font-semibold">This published answer could not be found.</h1>
      </Shell>
    );
  }

  const needsBlocker = outcome === "still-deciding" || outcome === "did-not";

  return (
    <Shell>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-brand">Someone sent you this</p>
      <div className="mt-4 flex items-center gap-2.5 border-b border-line pb-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">AM</div>
        <div className="min-w-0">
          <p className="text-[0.9rem] font-semibold">Aditi Mishra</p>
          <p className="text-[0.75rem] text-muted">{answer.room}</p>
        </div>
      </div>

      {answer.illustrative && (
        <div className="mt-5"><Pill tone="brand">Demo answer</Pill></div>
      )}

      <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">Her answer to</p>
      <h1 className="mt-1.5 text-[1.45rem] font-semibold leading-[1.2] tracking-[-0.02em]">{sentenceCase(answer.question)}</h1>
      <blockquote className="mt-5 text-[1.1rem] font-medium leading-7">&ldquo;{answer.decision}&rdquo;</blockquote>

      <div className="mt-7">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">How she decided</p>
        <ol className="mt-3 space-y-3">
          {answer.criteria.map((rule, index) => (
            <li key={rule} className="flex gap-3 text-[0.92rem] leading-6">
              <span className="tnum mt-0.5 text-[0.72rem] font-semibold text-brand">{String(index + 1).padStart(2, "0")}</span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </div>

      {answer.cost && (
        <div className="mt-7 rounded-md bg-paper p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">What it cost her</p>
          <p className="mt-1.5 text-[0.9rem] leading-6">{answer.cost}</p>
          {answer.wouldDoAgain !== undefined && (
            <p className="mt-3 text-[0.85rem] font-semibold">
              Would she do it again? <span className={answer.wouldDoAgain ? "text-acted" : "text-blocked"}>{answer.wouldDoAgain ? "Yes" : "No"}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-7 border-l-2 border-ink pl-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">Your next step</p>
        <p className="mt-1.5 text-[0.95rem] font-medium leading-6">{answer.nextStep}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={save} disabled={saved} className={`rounded-md px-3 py-3 text-[0.85rem] font-semibold ${saved ? "border border-acted bg-acted-soft text-acted" : "bg-ink text-white"}`}>
          {saved ? "Saved" : "Save this"}
        </button>
        <button type="button" onClick={forward} className="rounded-md border border-line-strong px-3 py-3 text-[0.85rem] font-semibold">
          {shareState === "copied" ? "Link copied" : shareState === "shared" ? "Sent" : shareState === "failed" ? "Try again" : "Send to someone"}
        </button>
      </div>

      {saved && !outcomeSent && (
        <button type="button" onClick={() => setShowOutcome((value) => !value)} className="mt-4 w-full text-center text-[0.8rem] font-medium text-brand underline underline-offset-4">
          {showOutcome ? "Hide outcome check-in" : "Tell Aditi what happened when you decide"}
        </button>
      )}

      {showOutcome && !outcomeSent && (
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-[0.9rem] font-semibold">What happened?</p>
          <div className="mt-3 grid gap-2">
            {([
              ["acted", "I did it"],
              ["still-deciding", "Still deciding"],
              ["did-not", "I decided not to"],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => { setOutcome(id); setBlocker(null); }} className={`rounded-md border px-3 py-2.5 text-left text-[0.82rem] font-medium ${outcome === id ? "border-ink bg-ink text-white" : "border-line-strong"}`}>
                {label}
              </button>
            ))}
          </div>
          {needsBlocker && (
            <div className="mt-4 flex flex-wrap gap-2">
              {blockers.map((item) => (
                <button key={item.id} type="button" onClick={() => setBlocker(item.id)} className={`rounded-full border px-3 py-1.5 text-[0.75rem] ${blocker === item.id ? "border-brand bg-brand text-white" : "border-line-strong"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={sendOutcome} disabled={!outcome || (needsBlocker && !blocker)} className="mt-4 w-full rounded-md bg-ink px-4 py-3 text-[0.85rem] font-semibold text-white disabled:bg-line-strong disabled:text-faint">
            Send outcome to Aditi
          </button>
        </div>
      )}

      {outcomeSent && <p className="mt-5 rounded-md bg-acted-soft p-3 text-[0.82rem] text-acted">Outcome recorded. This now appears against the published answer.</p>}
      {error && <p className="mt-4 text-[0.78rem] text-blocked">{error}</p>}
      <p className="mt-4 text-[0.75rem] leading-5 text-muted">No account is required. The browser receives an anonymous ID so duplicate saves are not counted twice.</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[520px] flex-col justify-center px-5 py-10">
      <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">{children}</div>
      <p className="mt-5 text-center text-[0.72rem] text-faint">Front Row · her judgement, not her calendar</p>
    </main>
  );
}
