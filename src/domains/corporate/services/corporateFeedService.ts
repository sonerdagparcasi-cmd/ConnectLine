// src/domains/corporate/services/corporateFeedService.ts

import type { CorporateFeedPost } from "../types/feed.types";
import type { CorporateFeedApi } from "./corporateFeedApi";
import { mockCorporateFeedApi } from "./mockCorporateFeedApi";

/**
 * 🔒 CORPORATE FEED SERVICE
 *
 * ADIM 11: Screen saf UI, Hook karar, Service state + optimistic
 * ADIM 12: Sync + reconcile + conflict handling
 * ADIM 13: Backend adapter (CorporateFeedApi)
 * ADIM 14: Offline queue + retry + exponential backoff + pending/failed
 *
 * KİLİTLER:
 * - Feed type değişmez (CorporateFeedPost)
 * - Hook API değişmez (getFeed / addPost / toggleLike)
 * - Like + double tap UX değişmez
 */

/* ------------------------------------------------------------------ */
/* INTERNAL TYPES                                                     */
/* ------------------------------------------------------------------ */

type SyncStatus = "pending" | "synced" | "failed";

type FeedPostInternal = CorporateFeedPost & {
  syncStatus?: SyncStatus;
  clientId?: string; // optimistic create için
};

type QueueItemBase = {
  id: string;
  kind: "createPost" | "toggleLike";
  retries: number;
  nextAttemptAt: number; // epoch ms
  createdAt: number; // epoch ms
};

type QueueCreatePost = QueueItemBase & {
  kind: "createPost";
  companyId: string;
  clientId: string;
  post: CorporateFeedPost;
};

type QueueToggleLike = QueueItemBase & {
  kind: "toggleLike";
  postId: string;
};

type QueueItem = QueueCreatePost | QueueToggleLike;

/** ✅ enqueue input tipi (Omit<Union> yerine net union) */
type EnqueueCreatePostInput = {
  kind: "createPost";
  companyId: string;
  clientId: string;
  post: CorporateFeedPost;
};

type EnqueueToggleLikeInput = {
  kind: "toggleLike";
  postId: string;
};

type EnqueueInput = EnqueueCreatePostInput | EnqueueToggleLikeInput;

/* ------------------------------------------------------------------ */
/* LOCAL STORE                                                        */
/* ------------------------------------------------------------------ */

let LOCAL_FEED: FeedPostInternal[] = [];
let SYNC_QUEUE: QueueItem[] = [];

/**
 * clientId → backendId map
 * createPost reconcile sonrası like queue’ları doğru id’ye taşır
 */
let CLIENT_TO_BACKEND_ID: Record<string, string> = {};

/* ------------------------------------------------------------------ */
/* CONFIG                                                             */
/* ------------------------------------------------------------------ */

const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 800;
const BACKOFF_MAX_MS = 30_000;

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function now() {
  return Date.now();
}

function genId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${now()}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeBackoffMs(retries: number) {
  const exp = BACKOFF_BASE_MS * Math.pow(2, retries);
  const jitter = Math.floor(Math.random() * 250);
  return clamp(exp + jitter, BACKOFF_BASE_MS, BACKOFF_MAX_MS);
}

function mergeRemoteAndLocal(
  remote: CorporateFeedPost[],
  local: FeedPostInternal[]
): FeedPostInternal[] {
  const remoteIds = new Set(remote.map((p) => p.id));

  // ✅ syncStatus widen olmasın diye SyncStatus’a sabitle
  const remoteMapped: FeedPostInternal[] = remote.map((p) => ({
    ...p,
    syncStatus: "synced" as SyncStatus,
  }));

  const pending = local.filter(
    (p) => p.syncStatus === "pending" && !remoteIds.has(p.id)
  );

  const failed = local.filter(
    (p) => p.syncStatus === "failed" && !remoteIds.has(p.id)
  );

  return [...pending, ...failed, ...remoteMapped];
}

function replaceLocalIdEverywhere(oldId: string, newId: string) {
  LOCAL_FEED = LOCAL_FEED.map((p) =>
    p.id === oldId ? { ...p, id: newId } : p
  );

  SYNC_QUEUE = SYNC_QUEUE.map((q) => {
    if (q.kind !== "toggleLike") return q;
    if (q.postId !== oldId) return q;
    return { ...q, postId: newId };
  });
}

function enqueue(input: EnqueueInput) {
  const qBase: QueueItemBase = {
    id: genId("q"),
    retries: 0,
    nextAttemptAt: now(),
    createdAt: now(),
    kind: input.kind,
  };

  const q: QueueItem =
    input.kind === "createPost"
      ? {
          ...qBase,
          kind: "createPost",
          companyId: input.companyId,
          clientId: input.clientId,
          post: input.post,
        }
      : {
          ...qBase,
          kind: "toggleLike",
          postId: input.postId,
        };

  SYNC_QUEUE = [...SYNC_QUEUE, q];
}

function markLocalPostStatus(postId: string, status: SyncStatus) {
  LOCAL_FEED = LOCAL_FEED.map((p) =>
    p.id === postId ? { ...p, syncStatus: status } : p
  );
}

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

class CorporateFeedService {
  private api: CorporateFeedApi;

  constructor(api: CorporateFeedApi) {
    this.api = api;
  }

  /* -------------------------------------------------------------- */
  /* QUEUE PROCESSING                                                */
  /* -------------------------------------------------------------- */

  private async flushQueueDue(): Promise<void> {
    const t = now();
    const due = SYNC_QUEUE.filter((q) => q.nextAttemptAt <= t);

    for (const item of due) {
      await this.processQueueItem(item);
    }

    SYNC_QUEUE = SYNC_QUEUE.filter((q) => q.retries <= MAX_RETRIES);
  }

  private async processQueueItem(item: QueueItem): Promise<void> {
    try {
      if (item.kind === "createPost") {
        const synced = await this.api.createPost(item.post);

        CLIENT_TO_BACKEND_ID[item.clientId] = synced.id;

        LOCAL_FEED = LOCAL_FEED.map((p) =>
          p.id === item.clientId
            ? { ...synced, syncStatus: "synced" as SyncStatus }
            : p
        );

        replaceLocalIdEverywhere(item.clientId, synced.id);

        SYNC_QUEUE = SYNC_QUEUE.filter((q) => q.id !== item.id);
        return;
      }

      if (item.kind === "toggleLike") {
        const mappedId = CLIENT_TO_BACKEND_ID[item.postId] ?? item.postId;

        await this.api.toggleLike(mappedId);

        SYNC_QUEUE = SYNC_QUEUE.filter((q) => q.id !== item.id);
        return;
      }
    } catch {
      const nextRetries = item.retries + 1;

      if (nextRetries > MAX_RETRIES) {
        if (item.kind === "createPost") {
          markLocalPostStatus(item.clientId, "failed");
        }

        SYNC_QUEUE = SYNC_QUEUE.filter((q) => q.id !== item.id);
        return;
      }

      const backoff = computeBackoffMs(nextRetries);

      SYNC_QUEUE = SYNC_QUEUE.map((q) =>
        q.id === item.id
          ? {
              ...q,
              retries: nextRetries,
              nextAttemptAt: now() + backoff,
            }
          : q
      );

      if (item.kind === "createPost") {
        markLocalPostStatus(item.clientId, "pending");
      }
    }
  }

  /* -------------------------------------------------------------- */
  /* PUBLIC API                                                      */
  /* -------------------------------------------------------------- */

  async getFeed(companyId: string): Promise<CorporateFeedPost[]> {
    await this.flushQueueDue();

    const remote = await this.api.fetchFeed(companyId);

    LOCAL_FEED = mergeRemoteAndLocal(remote, LOCAL_FEED);

    return LOCAL_FEED;
  }

  async addPost(post: CorporateFeedPost): Promise<void> {
    const clientId = genId("client-post");

    const optimistic: FeedPostInternal = {
      ...post,
      id: clientId,
      clientId,
      syncStatus: "pending",
    };

    LOCAL_FEED = [optimistic, ...LOCAL_FEED];

    enqueue({
      kind: "createPost",
      companyId: post.companyId,
      clientId,
      post,
    });

    await this.flushQueueDue();
  }

  async toggleLike(postId: string): Promise<void> {
    LOCAL_FEED = LOCAL_FEED.map((p) => {
      if (p.id !== postId) return p;

      const nextLiked = !p.liked;
      return {
        ...p,
        liked: nextLiked,
        likeCount: nextLiked ? p.likeCount + 1 : p.likeCount - 1,
      };
    });

    enqueue({
      kind: "toggleLike",
      postId,
    });

    await this.flushQueueDue();
  }
}

/**
 * 🔒 DEFAULT ADAPTER (MOCK)
 * Gerçek backend geldiğinde SADECE adapter değişir
 */
export const corporateFeedService = new CorporateFeedService(mockCorporateFeedApi);