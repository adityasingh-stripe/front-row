export default function MissingAnswerPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[520px] flex-col justify-center px-5 py-10">
      <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-faint">Nothing here</p>
        <h1 className="mt-3 text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.02em]">
          This link has no published answer ID.
        </h1>
        <p className="mt-3 text-[0.9rem] leading-6 text-muted">
          Ask whoever sent it to copy the complete Front Row link.
        </p>
      </div>
    </main>
  );
}
