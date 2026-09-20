/**
 * Her four recurring questions are stored exactly as she writes them in E-05.2,
 * in lower case: "was it worth it?", "how do I get in?".
 *
 * On her own pages that is right, because it is her list in her hand. On a card
 * a reader sees, the question is a heading rather than a citation, so it needs a
 * capital and no quote marks around it.
 */
export function sentenceCase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
