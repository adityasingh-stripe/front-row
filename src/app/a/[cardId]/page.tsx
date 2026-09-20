import SharedAnswerPage from "./shared-answer-page";

export default async function Page({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  return <SharedAnswerPage cardId={cardId} />;
}
