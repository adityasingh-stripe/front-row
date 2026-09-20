"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Arrow,
  Button,
  Cite,
  CiteProvider,
  Eyebrow,
  FrontRowMark,
  Panel,
  Pill,
  Stat,
} from "@/components/parts";
import {
  AudienceView,
  AuditView,
  BriefView,
  criteriaList,
  emptyJudgement,
  type DraftJudgement,
} from "@/components/answer-views";
import { answerBriefs, type AnswerBrief } from "@/lib/answers";
import { editorialQueue, type EditorialCandidate } from "@/lib/editorial";
import {
  createPublishedAnswer,
  getNotes,
  getPublishedAnswer,
  getPublishedAnswers,
  saveNote,
} from "@/lib/live-client";
import {
  emptySummary,
  type CardSummary,
  type CreatorNote,
  type PublishedAnswer,
} from "@/lib/live-types";

type View = "dashboard" | "capture" | "brief" | "audience" | "audit";

type WorkspaceSnapshot = {
  notes: CreatorNote[];
  published: Record<string, PublishedAnswer>;
  summaries: Record<string, CardSummary>;
};

async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  const [notes, cards] = await Promise.all([getNotes(), getPublishedAnswers()]);
  const published: Record<string, PublishedAnswer> = {};
  for (const card of cards) {
    if (!published[card.briefId]) published[card.briefId] = card;
  }
  const summaryEntries = await Promise.all(
    Object.values(published).map(async (card) => {
      const result = await getPublishedAnswer(card.id);
      return [card.id, result.summary] as const;
    }),
  );
  return { notes, published, summaries: Object.fromEntries(summaryEntries) };
}

export default function FrontRowDemo() {
  const [view, setView] = useState<View>("dashboard");
  const [citeMode, setCiteMode] = useState(false);
  const [activeBriefId, setActiveBriefId] = useState(answerBriefs[0].id);
  const [notes, setNotes] = useState<CreatorNote[]>([]);
  const [judgements, setJudgements] = useState<Record<string, DraftJudgement>>({});
  const [published, setPublished] = useState<Record<string, PublishedAnswer>>({});
  const [summaries, setSummaries] = useState<Record<string, CardSummary>>({});
  const [loading, setLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const brief = answerBriefs.find((item) => item.id === activeBriefId) ?? answerBriefs[0];
  const note = notes.find((item) => item.briefId === brief.id);
  const draft = judgements[activeBriefId] ?? emptyJudgement;
  const card = published[activeBriefId];
  const queue = useMemo(() => editorialQueue(notes), [notes]);

  useEffect(() => {
    getWorkspaceSnapshot()
      .then((snapshot) => {
        setNotes(snapshot.notes);
        setPublished(snapshot.published);
        setSummaries(snapshot.summaries);
      })
      .catch((error) => {
        setWorkspaceError(error instanceof Error ? error.message : "The creator workspace could not be opened.");
      })
      .finally(() => setLoading(false));
  }, []);

  const openBrief = (id: string) => {
    setActiveBriefId(id);
    setPublishError(null);
    setView("brief");
  };

  const openCapture = (id: string) => {
    setActiveBriefId(id);
    setView("capture");
  };

  const publish = async () => {
    if (!note) {
      setPublishError("Capture your room note before publishing your judgement.");
      return;
    }
    setPublishing(true);
    setPublishError(null);
    try {
      const next = await createPublishedAnswer({
        briefId: brief.id,
        question: brief.questionText,
        room: note.room,
        decision: draft.decision.trim(),
        criteria: criteriaList(draft),
        cost: draft.cost.trim() || undefined,
        wouldDoAgain: draft.wouldDoAgain ?? undefined,
        nextStep: draft.nextStep.trim(),
        illustrative: draft.illustrative,
      });
      setPublished((current) => ({ ...current, [brief.id]: next }));
      setSummaries((current) => ({ ...current, [next.id]: emptySummary }));
      setView("audience");
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "The answer could not be published.");
    } finally {
      setPublishing(false);
    }
  };

  const capture = async (input: Omit<CreatorNote, "updatedAt">) => {
    const saved = await saveNote(input);
    setNotes((current) => [saved, ...current.filter((item) => item.briefId !== saved.briefId)]);
    setView("dashboard");
  };

  return (
    <CiteProvider on={citeMode}>
      <div className="min-h-screen">
        <Header
          view={view}
          onNavigate={setView}
          onCapture={() => openCapture(activeBriefId)}
          citeMode={citeMode}
          onToggleCite={() => {
            if (citeMode && view === "audit") setView("dashboard");
            setCiteMode(!citeMode);
          }}
        />

        <main>
          {workspaceError && (
            <p className="mx-auto mt-6 max-w-6xl rounded-md border border-blocked/30 bg-blocked-soft px-4 py-3 text-[0.82rem] text-blocked">
              Workspace unavailable: {workspaceError}
            </p>
          )}
          {view === "dashboard" && (
            <Dashboard
              queue={queue}
              notes={notes}
              published={published}
              summaries={summaries}
              loading={loading}
              onOpenBrief={openBrief}
              onCapture={openCapture}
            />
          )}

          {view === "capture" && (
            <CaptureView
              brief={brief}
              existing={note}
              onSave={capture}
              onBack={() => setView("dashboard")}
            />
          )}

          {view === "brief" && (
            <BriefView
              brief={brief}
              draft={draft}
              published={Boolean(card)}
              note={note}
              onCaptureNote={() => openCapture(brief.id)}
              onChange={(next) => setJudgements((current) => ({ ...current, [activeBriefId]: next }))}
              onPublish={publish}
              publishing={publishing}
              publishError={publishError}
              onBack={() => setView("dashboard")}
            />
          )}

          {view === "audience" && card && (
            <AudienceView
              brief={brief}
              draft={draft}
              card={card}
              initialSummary={summaries[card.id] ?? emptySummary}
              onSummary={(summary) => setSummaries((current) => ({ ...current, [card.id]: summary }))}
              onBack={() => setView("brief")}
            />
          )}

          {view === "audit" && <AuditView onBack={() => setView("dashboard")} />}
        </main>
      </div>
    </CiteProvider>
  );
}

function Header({
  view,
  onNavigate,
  onCapture,
  citeMode,
  onToggleCite,
}: {
  view: View;
  onNavigate: (view: View) => void;
  onCapture: () => void;
  citeMode: boolean;
  onToggleCite: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-3 sm:px-8">
        <button type="button" onClick={() => onNavigate("dashboard")} className="flex items-center gap-2.5">
          <FrontRowMark className="h-7 w-7" />
          <span className="text-[0.95rem] font-semibold">Front Row</span>
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => onNavigate("dashboard")} className="px-2.5 py-1.5 text-[0.78rem]">
            Queue
          </Button>
          <Button variant="secondary" onClick={onCapture} className="px-2.5 py-1.5 text-[0.78rem]">
            Capture note
          </Button>
          <button
            type="button"
            onClick={onToggleCite}
            aria-pressed={citeMode}
            className={`rounded-md border px-2.5 py-1.5 text-[0.78rem] font-medium ${
              citeMode ? "border-brand bg-brand text-white" : "border-line-strong bg-surface text-muted"
            }`}
          >
            Sources {citeMode ? "on" : "off"}
          </button>
          {citeMode && (
            <button
              type="button"
              onClick={() => onNavigate(view === "audit" ? "dashboard" : "audit")}
              className="rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1.5 text-[0.78rem] font-medium text-brand"
            >
              {view === "audit" ? "Back to product" : "See the workings"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Dashboard({
  queue,
  notes,
  published,
  summaries,
  loading,
  onOpenBrief,
  onCapture,
}: {
  queue: EditorialCandidate[];
  notes: CreatorNote[];
  published: Record<string, PublishedAnswer>;
  summaries: Record<string, CardSummary>;
  loading: boolean;
  onOpenBrief: (id: string) => void;
  onCapture: (id: string) => void;
}) {
  const top = queue[0];
  const topNote = notes.find((note) => note.briefId === top.brief.id);
  const [copied, setCopied] = useState<string | null>(null);

  const copyHoldingReply = async (candidate: EditorialCandidate) => {
    await navigator.clipboard.writeText(candidate.holdingReply);
    setCopied(candidate.brief.id);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-line bg-surface px-5 py-3.5 text-[0.82rem]">
        <span className="font-semibold">Inbox snapshot · 06:40</span>
        <span className="text-muted">41 unread messages asking &ldquo;which event was this?&rdquo;</span>
        <span className="font-medium text-brand">Grouped into one question</span>
        <Cite>E-02</Cite>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>What to make next</Eyebrow>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[2.5rem]">
            Demand, judgement, then content.
          </h1>
        </div>
        <p className="max-w-sm text-[0.88rem] leading-6 text-muted">
          Front Row groups repeated questions. It does not turn them into individual reply work.
        </p>
      </div>

      <Panel className="mt-6 overflow-hidden">
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <div className="p-6 sm:p-8">
            <Pill tone="brand">Make this next</Pill>
            <h2 className="mt-5 text-[1.8rem] font-semibold leading-[1.15] tracking-[-0.03em]">
              {top.recommendation}
            </h2>
            <div className="mt-5 space-y-3 text-[0.9rem] leading-6 text-muted">
              <Reason label="Audience" text={top.demandSignal} />
              <Reason label="Format" text={top.formatSignal} />
              <Reason label="Material" text={top.materialSignal} />
            </div>
            <div className="mt-6 rounded-md bg-paper p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-faint">
                Cluster acknowledgement · illustrative
              </p>
              <p className="mt-2 text-[0.86rem] leading-6">&ldquo;{top.holdingReply}&rdquo;</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {topNote ? (
                <Button onClick={() => onOpenBrief(top.brief.id)}>Open the answer <Arrow /></Button>
              ) : (
                <Button onClick={() => onCapture(top.brief.id)}>Capture your insight <Arrow /></Button>
              )}
              <Button variant="secondary" onClick={() => copyHoldingReply(top)}>
                {copied === top.brief.id ? "Copied" : "Copy holding reply"}
              </Button>
            </div>
            <p className="mt-3 text-[0.72rem] text-muted">
              Illustrative wording. Edit before sending. This acknowledges the cluster instead of replying one by one.
            </p>
          </div>
          <div className="border-t border-line bg-paper p-6 sm:p-8 lg:border-l lg:border-t-0">
            <Eyebrow>Your note</Eyebrow>
            {topNote ? (
              <>
                <blockquote className="mt-4 text-[1.15rem] font-medium leading-7">&ldquo;{topNote.insight}&rdquo;</blockquote>
                <dl className="mt-6 space-y-4 text-[0.82rem]">
                  <SmallFact label="Room" value={topNote.room} />
                  <SmallFact label="Material" value={topNote.material} />
                  <SmallFact label="Would you do it again?" value={topNote.wouldDoAgain === null ? "Not recorded" : topNote.wouldDoAgain ? "Yes" : "No"} />
                </dl>
              </>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-line-strong p-4">
                <p className="text-[0.88rem] leading-6 text-muted">
                  The issued file contains a useful quote, but Front Row will not silently turn it into product input. You record the insight yourself.
                </p>
              </div>
            )}
          </div>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value="41" label="messages asking which event" note="High volume, weak reason to spend the next content slot." cite="E-02" />
        <Stat value="74K" label="saves on the honest cost post" note="Stronger intent than the glamour recap." cite="E-03.3" tone="brand" />
        <Stat value="40" label="Cannes clips already available" note="The raw material is half cut." cite="E-04.2" />
        <Stat value="3.1x" label="higher action after three saves" note="Historical relationship, not a promised outcome." cite="E-09.5" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Panel className="p-6 sm:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">Content order</p>
            <span className="text-[0.78rem] text-muted">Evidence-backed editorial queue</span>
          </div>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {queue.map((candidate) => {
              const hasNote = notes.some((item) => item.briefId === candidate.brief.id);
              const hasCard = Boolean(published[candidate.brief.id]);
              return (
                <div key={candidate.brief.id} className="flex flex-wrap items-center gap-4 py-4">
                  <span className="tnum text-[0.75rem] font-semibold text-faint">{String(candidate.rank).padStart(2, "0")}</span>
                  <button type="button" onClick={() => onOpenBrief(candidate.brief.id)} className="min-w-0 flex-1 text-left">
                    <span className="block text-[0.9rem] font-medium">{candidate.recommendation}</span>
                    <span className="mt-1 block text-[0.78rem] leading-5 text-muted">
                      {hasCard ? "Published" : hasNote ? "Insight captured, ready to answer" : actionLabel(candidate.action)}
                    </span>
                  </button>
                  {!hasNote && candidate.action !== "acknowledge" && (
                    <Button variant="ghost" onClick={() => onCapture(candidate.brief.id)} className="px-2 text-xs">Capture</Button>
                  )}
                  <Arrow />
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="p-6 sm:p-7">
          <p className="font-semibold">Published answer activity</p>
          <p className="mt-2 text-[0.8rem] leading-5 text-muted">Only events recorded by the deployed product appear here.</p>
          {loading ? (
            <p className="mt-6 text-sm text-muted">Loading shared workspace…</p>
          ) : Object.values(published).length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-line-strong p-4 text-[0.85rem] leading-6 text-muted">
              No answer has been published yet. There are no invented readers or outcomes filling this space.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {Object.values(published).map((item) => {
                const summary = summaries[item.id] ?? emptySummary;
                return (
                  <div key={item.id} className="border-b border-line pb-4 last:border-0">
                    <button type="button" onClick={() => onOpenBrief(item.briefId)} className="text-left text-[0.86rem] font-medium">{item.question}</button>
                    <p className="tnum mt-2 text-[0.75rem] text-muted">
                      {summary.saves} saves · {summary.forwards} forwards · {summary.attributedSaves} attributed saves · {summary.outcomes.acted + summary.outcomes.stillDeciding + summary.outcomes.didNot} outcomes
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Reason({ label, text }: { label: string; text: string }) {
  return <p><strong className="font-semibold text-ink">{label}:</strong> {text}</p>;
}

function SmallFact({ label, value }: { label: string; value: string }) {
  return <div><dt className="uppercase tracking-[0.08em] text-faint">{label}</dt><dd className="mt-1 font-medium text-ink">{value}</dd></div>;
}

function actionLabel(action: EditorialCandidate["action"]): string {
  if (action === "reconstruct") return "Reconstruct the lost judgement";
  if (action === "acknowledge") return "Acknowledge once, do not make next";
  return "Needs your insight";
}

function CaptureView({
  brief,
  existing,
  onSave,
  onBack,
}: {
  brief: AnswerBrief;
  existing?: CreatorNote;
  onSave: (note: Omit<CreatorNote, "updatedAt">) => Promise<void>;
  onBack: () => void;
}) {
  const [room, setRoom] = useState(existing?.room ?? brief.room);
  const [insight, setInsight] = useState(existing?.insight ?? "");
  const [material, setMaterial] = useState(existing?.material ?? brief.material.description);
  const [cost, setCost] = useState(existing?.cost ?? "");
  const [wouldDoAgain, setWouldDoAgain] = useState<boolean | null>(existing?.wouldDoAgain ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useDemoNote = () => {
    if (!brief.herNote) return;
    setRoom(brief.room);
    setInsight(brief.herNote.quote);
    setMaterial(brief.material.description);
    setCost("");
    setWouldDoAgain(null);
    setError(null);
  };

  const submit = async () => {
    if (!room.trim() || !insight.trim() || !material.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        briefId: brief.id,
        room: room.trim(),
        insight: insight.trim(),
        material: material.trim(),
        cost: cost.trim(),
        wouldDoAgain,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The note could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2"><Arrow dir="left" /> Back to the queue</Button>
      <Panel className="p-6 sm:p-8">
        <Eyebrow>Capture the judgement while it is fresh</Eyebrow>
        <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.03em]">What did the room teach you?</h1>
        <p className="mt-3 text-[0.9rem] leading-6 text-muted">
          Front Row can connect the note to repeated questions and available material. It cannot supply the insight.
        </p>
        {brief.herNote && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md border border-brand/20 bg-brand-soft px-4 py-3">
            <p className="min-w-0 flex-1 text-[0.8rem] leading-5 text-muted">
              Recording the demo? Fill the case-backed fields in one click.
            </p>
            <Button variant="secondary" onClick={useDemoNote} className="shrink-0 px-3 py-2 text-xs">
              Use demo note
            </Button>
          </div>
        )}

        <CaptureField label="Room" value={room} onChange={setRoom} rows={1} />
        <CaptureField
          label="The thing only you noticed"
          value={insight}
          onChange={setInsight}
          rows={3}
          placeholder={brief.herNote?.quote ? `For this demo, enter: “${brief.herNote.quote}”` : "The line you would tell your sister on the phone"}
        />
        <CaptureField label="Material you left with" value={material} onChange={setMaterial} rows={2} />
        <CaptureField label="What it cost (optional)" value={cost} onChange={setCost} rows={2} placeholder="Money, time, or the thing you gave up" />

        <div className="mt-6">
          <p className="text-[0.9rem] font-medium">Would you do it again? <span className="font-normal text-muted">(optional)</span></p>
          <div className="mt-2 flex gap-2">
            {[{ label: "Yes", value: true }, { label: "No", value: false }].map((option) => (
              <button key={option.label} type="button" onClick={() => setWouldDoAgain(option.value)} className={`rounded-md border px-5 py-2 text-sm font-medium ${wouldDoAgain === option.value ? "border-ink bg-ink text-white" : "border-line-strong"}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-line pt-6">
          <Button onClick={submit} disabled={!room.trim() || !insight.trim() || !material.trim() || saving}>
            {saving ? "Saving…" : "Save to the content queue"} <Arrow />
          </Button>
        </div>
        {error && <p className="mt-3 text-right text-[0.8rem] text-blocked">{error}</p>}
      </Panel>
    </div>
  );
}

function CaptureField({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div className="mt-6">
      <label className="text-[0.9rem] font-medium">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-md border border-line-strong bg-surface p-3.5 text-[0.95rem] leading-6 outline-none focus:border-brand"
      />
    </div>
  );
}
