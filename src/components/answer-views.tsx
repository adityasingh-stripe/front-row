"use client";

import { useState } from "react";
import {
  Arrow,
  Bookmark,
  Button,
  Check,
  Cite,
  Eyebrow,
  Forward,
  Panel,
  PhoneFrame,
  Pill,
  ProvenanceNote,
  Stat,
} from "./parts";
import {
  answerBriefs,
  audienceInvitation,
  illustrativeSample,
  voiceFilter,
  type AnswerBrief,
} from "@/lib/answers";
import { intentLog } from "@/lib/evidence/intent-log";
import { clickCohorts, saveThresholdCohorts, selfCheck } from "@/lib/engine";
import { audienceUrl, recordAudienceEvent, shareLink, visitorId } from "@/lib/live-client";
import type { CardSummary, CreatorNote, PublishedAnswer } from "@/lib/live-types";
import { compactNumber, formatName, ratePercent, postRows } from "@/lib/view-model";
import { sentenceCase } from "@/lib/text";

/** What Aditi types. Nothing here is ever pre-written for her. */
export type DraftJudgement = {
  decision: string;
  cost: string;
  criteria: string;
  nextStep: string;
  wouldDoAgain: boolean | null;
  illustrative: boolean;
};

export const emptyJudgement: DraftJudgement = {
  decision: "",
  cost: "",
  criteria: "",
  nextStep: "",
  wouldDoAgain: null,
  illustrative: false,
};

export function isComplete(draft: DraftJudgement): boolean {
  return (
    draft.decision.trim().length > 0 &&
    draft.criteria.trim().length > 0 &&
    draft.nextStep.trim().length > 0
  );
}

export function criteriaList(draft: DraftJudgement): string[] {
  return draft.criteria
    .split("\n")
    .map((line) => line.replace(/^[-•*\d.\s]+/, "").trim())
    .filter(Boolean);
}

/* ================================================================== *
 * BRIEF — Aditi's side. Everything pre-filled except the judgement.
 * ================================================================== */

export function BriefView({
  brief,
  draft,
  onChange,
  onPublish,
  onBack,
  published,
  note,
  onCaptureNote,
  publishing,
  publishError,
}: {
  brief: AnswerBrief;
  draft: DraftJudgement;
  onChange: (next: DraftJudgement) => void;
  onPublish: () => void;
  onBack: () => void;
  published: boolean;
  note?: CreatorNote;
  onCaptureNote: () => void;
  publishing: boolean;
  publishError: string | null;
}) {
  const set = <K extends keyof DraftJudgement>(key: K, value: DraftJudgement[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
        <Arrow dir="left" /> What to make next
      </Button>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* What the product already worked out */}
        <Panel className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>The brief</Eyebrow>
            <Pill tone={published ? "acted" : "brand"}>{published ? "Published" : "Ready to answer"}</Pill>
          </div>

          <h1 className="mt-4 text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.3rem]">
            &ldquo;{brief.questionText}&rdquo;
          </h1>
          <p className="mt-3 text-[0.95rem] leading-6 text-muted">{brief.pressure}</p>

          {/*
            Grouped by provenance, because "how would this product know that?" is
            the hardest fair question anyone can ask it. Two sources, labelled.
            Anything the product cannot legitimately reach has to be entered by
            her, and saying so is better than quietly pre-filling it.
          */}
          <div className="mt-8 border-t border-line pt-6">
            <Eyebrow>Issued audience evidence</Eyebrow>
            <p className="mt-1.5 text-[0.8rem] leading-5 text-muted">
              The inbox and post evidence supplied for this case. A live integration is not claimed here.
            </p>

            <ul className="mt-4 space-y-3">
              {brief.demand.map((item) => (
                <li key={item.ref} className="border-l-2 border-line-strong pl-3">
                  <p className="text-[0.9rem] leading-6 text-ink-soft">
                    &ldquo;{item.quote}&rdquo;
                    <Cite>{item.ref}</Cite>
                  </p>
                </li>
              ))}
            </ul>

            {brief.formatEvidence && (
              <div className="mt-5">
                <p className="text-[0.78rem] uppercase tracking-[0.08em] text-faint">
                  Format that converts for you
                </p>
                <p className="mt-1 text-[0.9rem] font-medium">{formatName(brief.format)}</p>
                <p className="mt-1 text-[0.85rem] leading-6 text-muted">
                  {brief.formatEvidence.text}
                  <Cite>{brief.formatEvidence.ref}</Cite>
                </p>
              </div>
            )}
          </div>

          <div className="mt-7 border-t border-line pt-6">
            <Eyebrow>Your room note</Eyebrow>
            <p className="mt-1.5 text-[0.8rem] leading-5 text-muted">
              This is entered by Aditi. Front Row does not invent the insight behind the content.
            </p>

            {note ? (
              <>
                <dl className="mt-4 divide-y divide-line border-y border-line">
                  <Row label="Room" value={note.room} />
                  <Row label="Material logged" value={note.material} />
                </dl>
              <div className="mt-4 rounded-md bg-paper p-4">
                <p className="text-[0.78rem] uppercase tracking-[0.08em] text-faint">
                    The insight you captured
                </p>
                <p className="mt-1.5 text-[0.9rem] leading-6">
                    &ldquo;{note.insight}&rdquo;
                </p>
              </div>
              </>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-line-strong p-4">
                <p className="text-[0.85rem] leading-6 text-muted">
                  No creator note has been captured for this answer. The issued asset inventory says
                  {" "}&ldquo;{brief.herNote?.quote ?? brief.material.description}&rdquo;, but that does not become
                  Aditi&rsquo;s product input until she records it.
                </p>
                <Button variant="secondary" onClick={onCaptureNote} className="mt-3">
                  Capture the note <Arrow />
                </Button>
              </div>
            )}
          </div>
        </Panel>

        {/* The only empty fields in the product */}
        <Panel className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Eyebrow className="text-brand">The part only you can write</Eyebrow>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
                Your answer, in your words.
              </h2>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                onChange({
                  decision: illustrativeSample.judgement.decision,
                  cost: illustrativeSample.judgement.cost,
                  criteria: illustrativeSample.judgement.criteria.join("\n"),
                  nextStep: illustrativeSample.judgement.nextStep,
                  wouldDoAgain: illustrativeSample.judgement.wouldDoAgain,
                  illustrative: true,
                })
              }
              className="text-xs"
            >
              Fill with sample
            </Button>
          </div>

          <p className={`mt-5 rounded-md border px-4 py-3 text-[0.8rem] leading-5 ${
            draft.illustrative
              ? "border-blocked/30 bg-blocked-soft text-blocked"
              : "border-line bg-paper text-muted"
          }`}>
            {draft.illustrative
              ? "Illustrative demo answer. It is not case evidence and not Aditi’s words. This label will remain on every shared surface."
              : "Nothing on this page is generated. Aditi writes the judgement and it is published without rewriting."}
          </p>

          <Field
            id="decision"
            label="What did you decide"
            hint={voiceFilter.prompt}
            value={draft.decision}
            onChange={(v) => set("decision", v)}
            placeholder="I would..."
            rows={3}
          />

          <Field
            id="criteria"
            label="How you decided"
            hint="One rule per line. This is the part that travels to someone in a situation you have never been in."
            value={draft.criteria}
            onChange={(v) => set("criteria", v)}
            placeholder={"Name the three conversations it has to create.\nPrice the whole week, not the ticket."}
            rows={4}
          />

          <Field
            id="cost"
            label="What it actually cost"
            hint="Money, time, or the thing you gave up."
            value={draft.cost}
            onChange={(v) => set("cost", v)}
            placeholder="One week, and..."
            rows={2}
          />

          <div className="mt-6">
            <label className="text-[0.9rem] font-medium">Would you do it again</label>
            <div className="mt-2.5 flex gap-2">
              {[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => set("wouldDoAgain", option.value)}
                  className={`rounded-md border px-5 py-2 text-sm font-medium transition ${
                    draft.wouldDoAgain === option.value
                      ? "border-ink bg-ink text-white"
                      : "border-line-strong bg-surface hover:border-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Field
            id="next-step"
            label="One next step for them"
            hint="What can someone do before they spend anything?"
            value={draft.nextStep}
            onChange={(v) => set("nextStep", v)}
            placeholder="Before you book, ..."
            rows={2}
          />

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-[0.8rem] text-muted">Published exactly as written. No rewriting.</p>
            <Button onClick={onPublish} disabled={!isComplete(draft) || publishing || !note}>
              {publishing
                ? "Publishing…"
                : !note
                  ? "Capture note before publishing"
                  : published
                    ? "Publish updated answer"
                    : "Publish this answer"} <Arrow />
            </Button>
          </div>
          {publishError && <p className="mt-3 text-right text-[0.8rem] text-blocked">{publishError}</p>}
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value, cite }: { label: string; value: string; cite?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-3.5">
      <dt className="text-[0.8rem] uppercase tracking-[0.08em] text-faint">{label}</dt>
      <dd className="text-[0.92rem] font-medium">
        {value}
        <Cite>{cite}</Cite>
      </dd>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
}) {
  return (
    <div className="mt-6">
      <label htmlFor={id} className="text-[0.9rem] font-medium">
        {label}
      </label>
      <p className="mt-1 text-[0.8rem] leading-5 text-muted">{hint}</p>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2.5 w-full resize-none rounded-md border border-line-strong bg-surface p-3.5 text-[0.95rem] leading-6 outline-none transition placeholder:text-faint focus:border-brand"
      />
    </div>
  );
}

/* ================================================================== *
 * AUDIENCE — the reader's side. A phone, three taps.
 * ================================================================== */

export function AudienceView({
  brief,
  draft,
  card,
  initialSummary,
  onSummary,
  onBack,
}: {
  brief: AnswerBrief;
  draft: DraftJudgement;
  card: PublishedAnswer;
  initialSummary: CardSummary;
  onSummary: (summary: CardSummary) => void;
  onBack: () => void;
}) {
  const rules = criteriaList(draft);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const [summary, setSummary] = useState(initialSummary);
  const [saved, setSaved] = useState(false);
  const [forwarded, setForwarded] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [shareEventId, setShareEventId] = useState<string | undefined>();

  const link = audienceUrl(card.id, shareEventId);

  const updateSummary = (next: CardSummary) => {
    setSummary(next);
    onSummary(next);
  };

  const handleSave = async () => {
    if (saved) return;
    setEventError(null);
    try {
      const result = await recordAudienceEvent(card.id, {
        type: "save",
        visitorId: `${visitorId()}_preview`,
      });
      updateSummary(result.summary);
      setSaved(true);
    } catch (error) {
      setEventError(error instanceof Error ? error.message : "The save could not be recorded.");
    }
  };

  const handleForward = async () => {
    setEventError(null);
    try {
      const result = await recordAudienceEvent(card.id, {
        type: "forward",
        visitorId: `${visitorId()}_preview`,
      });
      setShareEventId(result.event.id);
      updateSummary(result.summary);
      const state = await shareLink(audienceUrl(card.id, result.event.id), card.decision);
      setShareState(state);
      setForwarded(state !== "failed");
    } catch (error) {
      setShareState("failed");
      setEventError(error instanceof Error ? error.message : "The forward could not be recorded.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
        <Arrow dir="left" /> Back to the brief
      </Button>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <Eyebrow>What a reader sees</Eyebrow>
          <h1 className="mt-4 max-w-md text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.03em]">
            One decision, made easier.
          </h1>
          <p className="mt-4 max-w-md text-[0.95rem] leading-7 text-muted">
            The answer has a real ID. Saves, forwards and outcomes are recorded against it, including
            actions from someone who received a forwarded link.
          </p>

          <div className="mt-6 max-w-md rounded-md bg-paper p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">
              Your own note
            </p>
            <p className="mt-1.5 text-[0.9rem] leading-6">
              &ldquo;{audienceInvitation.quote}&rdquo;
              <Cite>{audienceInvitation.ref}</Cite>
            </p>
            <p className="mt-2 text-[0.8rem] leading-5 text-muted">This is that, working.</p>
          </div>

          <dl className="mt-8 space-y-4 border-t border-line pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[0.85rem] text-muted">Recorded saves</dt>
              <dd className="tnum text-lg font-semibold">{summary.saves}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[0.85rem] text-muted">Recorded forwards</dt>
              <dd className="tnum text-lg font-semibold">{summary.forwards}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[0.85rem] text-muted">Saves attributed to a forward</dt>
              <dd className="tnum text-lg font-semibold">{summary.attributedSaves}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.8rem] leading-5 text-muted">
            The issued evidence reports a 3.1x higher action rate after three saves. Front Row records
            the behaviour without presenting that historical relationship as a promise.
            <Cite>E-09.5</Cite>
          </p>

          <a
            href={audienceUrl(card.id)}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium hover:border-ink"
          >
            Open the live reader page <Arrow />
          </a>
        </div>

        <PhoneFrame
          caption={
            link
              ? "A real published link. Open it in another tab or on your phone: the server loads the answer by ID and records audience activity against it."
              : undefined
          }
        >
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">
              AM
            </div>
            <div className="min-w-0">
              <p className="text-[0.85rem] font-semibold">Aditi Mishra</p>
              <p className="text-[0.7rem] text-muted">{brief.room}</p>
            </div>
          </div>

          {/*
            This used to print E-05.3, "let people bring me their own decision".
            That is Aditi's private note to herself about building this, so on the
            card her audience reads it is incoherent: the reader has no idea who
            "me" is. It now lives on her side of this screen, attributed to her.
          */}
          <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">
            Her answer to
          </p>
          <h2 className="mt-1.5 text-[1.35rem] font-semibold leading-[1.25] tracking-[-0.02em]">
            {sentenceCase(brief.questionText)}
          </h2>

          {draft.illustrative && (
            <p className="mt-4 rounded-md border border-blocked/30 bg-blocked-soft px-3 py-2.5 text-[0.75rem] leading-5 text-blocked">
              Illustrative demo answer. Not case evidence and not Aditi&rsquo;s words.
            </p>
          )}

          {draft.decision ? (
            <>
              <blockquote className="mt-5 text-[1.05rem] font-medium leading-7">
                &ldquo;{draft.decision}&rdquo;
              </blockquote>

              {rules.length > 0 && (
                <div className="mt-6">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">
                    How she decided
                  </p>
                  <ol className="mt-3 space-y-2.5">
                    {rules.map((rule, index) => (
                      <li key={rule} className="flex gap-2.5 text-[0.88rem] leading-6">
                        <span className="tnum mt-0.5 text-[0.7rem] font-semibold text-brand">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {draft.cost && (
                <div className="mt-6 rounded-md bg-paper p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">
                    What it cost her
                  </p>
                  <p className="mt-1.5 text-[0.88rem] leading-6">{draft.cost}</p>
                  {draft.wouldDoAgain !== null && (
                    <p className="mt-3 text-[0.82rem] font-semibold">
                      Would she do it again?{" "}
                      <span className={draft.wouldDoAgain ? "text-acted" : "text-blocked"}>
                        {draft.wouldDoAgain ? "Yes" : "No"}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 border-l-2 border-ink pl-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">
                  Your next step
                </p>
                <p className="mt-1.5 text-[0.92rem] font-medium leading-6">{draft.nextStep}</p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saved}
                  className="flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-3 text-[0.85rem] font-semibold text-white transition hover:bg-brand disabled:bg-acted disabled:cursor-default"
                >
                  <Bookmark filled={saved} /> {saved ? "Saved" : "Save this"}
                </button>
                <button
                  type="button"
                  onClick={handleForward}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-[0.85rem] font-semibold transition ${
                    forwarded
                      ? "border-acted bg-acted-soft text-acted"
                      : "border-line-strong bg-surface hover:border-ink"
                  }`}
                >
                  {forwarded ? <Check /> : <Forward />}{" "}
                  {shareState === "copied"
                    ? "Link copied"
                    : shareState === "shared"
                      ? "Sent"
                      : shareState === "failed"
                        ? "Copy failed"
                        : "Send to someone"}
                </button>
              </div>

              {shareState !== "idle" && (
                <div className="mt-3 rounded-md bg-paper p-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-faint">
                    Paste this anywhere
                  </p>
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all font-mono text-[0.68rem] leading-4 text-brand underline decoration-brand/30 underline-offset-2"
                  >
                    {link.length > 120 ? `${link.slice(0, 120)}…` : link}
                  </a>
                </div>
              )}

              <p className="mt-3 text-center text-[0.7rem] leading-4 text-muted">
                The live reader page records a save once per browser and lets the reader report an outcome when they have one.
              </p>
              {eventError && <p className="mt-3 text-center text-[0.72rem] text-blocked">{eventError}</p>}
            </>
          ) : (
            <p className="mt-6 rounded-md border border-dashed border-line-strong p-5 text-[0.85rem] leading-6 text-muted">
              Nothing published yet. Aditi writes the answer on the brief, and it appears here
              exactly as she wrote it.
            </p>
          )}
        </PhoneFrame>
      </div>
    </div>
  );
}

/* ================================================================== *
 * AUDIT — for judges, not for Aditi. Every figure, traced.
 * ================================================================== */

export function AuditView({ onBack }: { onBack: () => void }) {
  const checks = selfCheck();
  const clicks = clickCohorts();
  const saves = saveThresholdCohorts();
  const rows = postRows();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
        <Arrow dir="left" /> Back to the product
      </Button>

      <Eyebrow>The workings</Eyebrow>
      <h1 className="mt-3 max-w-2xl text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.03em]">
        Historical evidence stays separate from live product events.
      </h1>
      <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-muted">
        The historical percentages below are computed from the twelve issued rows. The content queue
        cites the supplied inbox, post and asset evidence directly. Saves, forwards and outcomes shown
        in the product come only from events recorded after an answer is published.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {checks.map((check) => (
          <Panel key={check.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[0.92rem] font-semibold">{check.label}</p>
              <Pill tone={check.consistent ? "acted" : "blocked"}>
                {check.consistent ? "Replicates" : "Diverges"}
              </Pill>
            </div>
            <dl className="mt-4 space-y-2 text-[0.85rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Computed here</dt>
                <dd className="tnum text-right font-medium">{check.computed}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Stated on the sheet</dt>
                <dd className="tnum text-right font-medium">{check.stated}</dd>
              </div>
            </dl>
            {check.note && <p className="mt-3 text-[0.78rem] leading-5 text-muted">{check.note}</p>}
          </Panel>
        ))}
      </div>

      <Panel className="mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[0.92rem] font-semibold">Cohorts</p>
          <p className="text-[0.8rem] text-muted">
            Clicking is not a weak signal of intent here. It is a negative one.
          </p>
        </div>
        <div className="mt-5 grid gap-6 sm:grid-cols-4">
          <Stat value={`${(clicks.notClicked.rate * 100).toFixed(1)}%`} label="never clicked, acted" tone="acted" />
          <Stat value={`${(clicks.clicked.rate * 100).toFixed(1)}%`} label="clicked, acted" tone="blocked" />
          <Stat
            value={`${(saves.atOrAbove.rate * 100).toFixed(0)}%`}
            label={`saved ${saves.threshold}+, acted (${saves.atOrAbove.acted}/${saves.atOrAbove.n})`}
            tone="acted"
          />
          <Stat value={`${(saves.below.rate * 100).toFixed(0)}%`} label={`saved under ${saves.threshold}, acted`} tone="blocked" />
        </div>
      </Panel>

      <Panel className="mt-6 overflow-x-auto p-5 sm:p-6">
        <p className="text-[0.92rem] font-semibold">
          The twelve rows <span className="font-normal text-muted">· E-10, transcribed verbatim</span>
        </p>
        <p className="mt-2 max-w-3xl text-[0.8rem] leading-5 text-muted">
          These are the case file&rsquo;s own anonymised references, not readers in this product.
          Aditi is never shown an individual: on her dashboard this same behaviour appears only as
          cohort counts. Rows are printed here, on a page she does not see, so the arithmetic can be
          checked.
        </p>
        <table className="tnum mt-4 w-full min-w-[620px] text-left text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-[0.72rem] uppercase tracking-[0.08em] text-faint">
              <th className="py-2 pr-4 font-semibold">Case ref</th>
              <th className="py-2 pr-4 font-semibold">Saves</th>
              <th className="py-2 pr-4 font-semibold">Shares</th>
              <th className="py-2 pr-4 font-semibold">Returns</th>
              <th className="py-2 pr-4 font-semibold">Clicked</th>
              <th className="py-2 pr-4 font-semibold">Acted</th>
              <th className="py-2 font-semibold">Days</th>
            </tr>
          </thead>
          <tbody>
            {intentLog.map((row) => (
              <tr key={row.user} className="border-b border-line/60 last:border-0">
                <td className="py-2.5 pr-4 font-mono text-[0.78rem]">{row.user}</td>
                <td className={`py-2.5 pr-4 ${row.saves >= 3 ? "font-semibold" : "text-muted"}`}>{row.saves}</td>
                <td className="py-2.5 pr-4 text-muted">{row.shares}</td>
                <td className="py-2.5 pr-4 text-muted">{row.returns}</td>
                <td className="py-2.5 pr-4">{row.linkClick ? "Yes" : <span className="text-faint">No</span>}</td>
                <td className={`py-2.5 pr-4 font-semibold ${row.acted ? "text-acted" : "text-blocked"}`}>
                  {row.acted ? "Yes" : "No"}
                </td>
                <td className="py-2.5 text-muted">{row.daysToAct ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 max-w-3xl text-[0.8rem] leading-5 text-muted">
          U-241 saved twice, shared twice, returned twice and never acted. Under her current metrics
          that row is a failure. They passed her judgement to two other people, and the action may
          have happened in someone else&rsquo;s account entirely. It is the one row in this table that
          argues for the whole product.
        </p>
      </Panel>

      <Panel className="mt-6 overflow-x-auto p-5 sm:p-6">
        <p className="text-[0.92rem] font-semibold">
          Reach against intent <span className="font-normal text-muted">· E-03, all five posts</span>
        </p>
        <table className="tnum mt-4 w-full min-w-[640px] text-left text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-[0.72rem] uppercase tracking-[0.08em] text-faint">
              <th className="py-2 pr-4 font-semibold">Post</th>
              <th className="py-2 pr-4 font-semibold">Views</th>
              <th className="py-2 pr-4 font-semibold">Saves</th>
              <th className="py-2 pr-4 font-semibold">Sign-ups</th>
              <th className="py-2 pr-4 font-semibold">Save rate</th>
              <th className="py-2 pr-4 font-semibold">Conversion</th>
              <th className="py-2 font-semibold">Reach rank</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.cite} className="border-b border-line/60 last:border-0">
                <td className="max-w-[240px] py-2.5 pr-4">{row.title}</td>
                <td className="py-2.5 pr-4 text-muted">{compactNumber(row.views)}</td>
                <td className="py-2.5 pr-4 text-muted">{compactNumber(row.saves)}</td>
                <td className="py-2.5 pr-4 font-semibold">{row.signups}</td>
                <td className="py-2.5 pr-4">{ratePercent(row.saveRate, 1)}</td>
                <td className="py-2.5 pr-4 font-semibold">{ratePercent(row.signupRate)}</td>
                <td className="py-2.5 text-muted">#{row.reachRank}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[0.8rem] leading-5 text-muted">
          Sorted by conversion, the reach ranks read 5, 3, 1, 2, 4. Her widest post is fourth from
          top on save rate and last on conversion.
        </p>
      </Panel>

      <div className="mt-6">
        <ProvenanceNote>
          Front Row does not generate audience volume or outcomes. The issued dataset explains which
          behaviour matters; it does not pre-populate the live activity view. Illustrative judgement
          remains labelled wherever it appears.
        </ProvenanceNote>
      </div>

      <p className="mt-6 text-[0.8rem] text-muted">
        {answerBriefs.length} briefs loaded. Her own note: &ldquo;curate 5&rdquo;.
      </p>
    </div>
  );
}
