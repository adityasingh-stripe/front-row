/**
 * Constraints stated by readers in E-01.
 *
 * These are offered only after a reader reports that they did not act or are
 * still deciding. Front Row records the selected constraint; it does not
 * generate or predict one.
 */
export const blockers = [
  { id: "cost", label: "Cost", phrase: "cost", ref: "E-01.4", quote: "I have about £600 and a lot of nerve." },
  { id: "location", label: "Not in the right city", phrase: "being in the wrong city", ref: "E-01.3", quote: "I am not in London. How would you do it from Bangalore?" },
  { id: "access", label: "No way in", phrase: "having no route in", ref: "E-01.1", quote: "WHICH event was this, I am begging you" },
  { id: "permission", label: "Employer / visibility", phrase: "their employer", ref: "E-01.9", quote: "I want to build in public without annoying my employer." },
  { id: "language", label: "Language", phrase: "language", ref: "E-01.6", quote: "Can you do this one in Hindi? My mum still does not understand what I do." },
] as const;

export type Blocker = (typeof blockers)[number]["id"];
