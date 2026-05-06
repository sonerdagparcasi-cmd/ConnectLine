export type SocialHighlight = {
  id: string;
  userId: string;
  title: string;
  coverStoryId: string;
  coverUri: string | null;
  storyIds: string[];
  createdAt: string;
};

let highlights: SocialHighlight[] = [];
let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeHighlights(l: () => void) {
  listeners.push(l);
  return () => {
    listeners = listeners.filter((x) => x !== l);
  };
}

export function getHighlightsByUser(userId: string): SocialHighlight[] {
  return highlights.filter((h) => h.userId === userId);
}

export function createHighlight(params: {
  userId: string;
  title: string;
  storyIds: string[];
  coverUri: string | null;
}): SocialHighlight {
  const h: SocialHighlight = {
    id: "hl_" + Date.now(),
    userId: params.userId,
    title: params.title,
    coverStoryId: params.storyIds[0] ?? "",
    coverUri: params.coverUri,
    storyIds: params.storyIds,
    createdAt: new Date().toISOString(),
  };
  highlights = [h, ...highlights];
  emit();
  return h;
}

export function deleteHighlight(id: string) {
  highlights = highlights.filter((h) => h.id !== id);
  emit();
}
