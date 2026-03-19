// src/domains/chat/services/chatMediaService.ts
// Chat domain only
// UI-only ama backend-ready media upload/download queue katmanı

import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  MediaDownloadStatus,
  MediaUploadStatus,
} from "./chatMessageFactory";

export type MediaUploadOptions = {
  uri: string;
  type: "image" | "video" | "file";
  fileName?: string;
  onProgress?: (progress: number) => void;
};

export type UploadResult = {
  url: string;
  success: boolean;
};

export type MediaQueueItem = {
  id: string;
  uri: string;
  type: "image" | "video" | "file";
  fileName?: string;
  compressedUri?: string;
  uploadStatus: MediaUploadStatus;
  progress: number;
  retryCount: number;
  createdAt: number;
  uploadedUrl?: string;
  errorMessage?: string;
};

export type MediaCacheEntry = {
  mediaId: string;
  remoteUrl: string;
  cachedUri: string;
  downloadedAt: number;
  downloadStatus: MediaDownloadStatus;
};

const UPLOAD_QUEUE_KEY = "chat_media_upload_queue_v1";
const DOWNLOAD_CACHE_KEY = "chat_media_download_cache_v1";
const PER_CHAT_STORAGE_KEY = "chat_storage_per_chat_v1";

export type PerChatStorageBreakdown = {
  mediaMB: number;
  videosMB: number;
  filesMB: number;
};

function defaultBreakdown(): PerChatStorageBreakdown {
  return { mediaMB: 0, videosMB: 0, filesMB: 0 };
}

async function readPerChatStorage(): Promise<Record<string, PerChatStorageBreakdown>> {
  try {
    const raw = await AsyncStorage.getItem(PER_CHAT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PerChatStorageBreakdown>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writePerChatStorage(map: Record<string, PerChatStorageBreakdown>): Promise<void> {
  await AsyncStorage.setItem(PER_CHAT_STORAGE_KEY, JSON.stringify(map));
}

const MAX_RETRY = 3;
const MOCK_FAIL_RATE = 0;
const TICK_MS = 140;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readUploadQueue(): Promise<MediaQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MediaQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUploadQueue(queue: MediaQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
}

async function readDownloadCache(): Promise<MediaCacheEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOAD_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MediaCacheEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeDownloadCache(cache: MediaCacheEntry[]): Promise<void> {
  await AsyncStorage.setItem(DOWNLOAD_CACHE_KEY, JSON.stringify(cache));
}

function buildRemoteUrl(item: MediaQueueItem) {
  const name = item.fileName?.trim() || `${item.type}-${item.id}`;
  return `chat-media://${item.type}/${name}`;
}

async function compressMedia(
  item: MediaQueueItem
): Promise<MediaQueueItem> {
  if (item.type === "file") {
    return {
      ...item,
      compressedUri: item.uri,
    };
  }

  await wait(120);

  return {
    ...item,
    compressedUri: item.uri,
  };
}

async function updateQueueItem(
  id: string,
  patch: Partial<MediaQueueItem>
): Promise<MediaQueueItem | null> {
  const queue = await readUploadQueue();
  const index = queue.findIndex((item) => item.id === id);

  if (index === -1) return null;

  const next = {
    ...queue[index],
    ...patch,
  };

  queue[index] = next;
  await writeUploadQueue(queue);

  return next;
}

async function removeQueueItem(id: string): Promise<void> {
  const queue = await readUploadQueue();
  await writeUploadQueue(queue.filter((item) => item.id !== id));
}

async function enqueueUpload(
  options: MediaUploadOptions
): Promise<MediaQueueItem> {
  const item: MediaQueueItem = {
    id: makeId(),
    uri: options.uri,
    type: options.type,
    fileName: options.fileName,
    compressedUri: undefined,
    uploadStatus: "idle",
    progress: 0,
    retryCount: 0,
    createdAt: Date.now(),
    uploadedUrl: undefined,
    errorMessage: undefined,
  };

  const queue = await readUploadQueue();
  queue.push(item);
  await writeUploadQueue(queue);

  return item;
}

async function runUploadAttempt(
  item: MediaQueueItem,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  let next = await updateQueueItem(item.id, {
    uploadStatus: "uploading",
    errorMessage: undefined,
  });

  if (!next) {
    return { url: "", success: false };
  }

  next = await compressMedia(next);
  await updateQueueItem(item.id, {
    compressedUri: next.compressedUri,
  });

  let progress = 0;

  while (progress < 1) {
    progress = Math.min(progress + 0.14, 1);
    onProgress?.(progress);

    await updateQueueItem(item.id, {
      progress,
      uploadStatus: "uploading",
    });

    await wait(TICK_MS);
  }

  if (Math.random() < MOCK_FAIL_RATE) {
    const failedRetryCount = (next.retryCount ?? 0) + 1;

    await updateQueueItem(item.id, {
      uploadStatus: "failed",
      retryCount: failedRetryCount,
      errorMessage: "UPLOAD_FAILED",
    });

    return { url: "", success: false };
  }

  const url = buildRemoteUrl(next);

  await updateQueueItem(item.id, {
    progress: 1,
    uploadStatus: "uploaded",
    uploadedUrl: url,
    errorMessage: undefined,
  });

  return {
    url,
    success: true,
  };
}

export const chatMediaService = {
  async upload(options: MediaUploadOptions): Promise<UploadResult> {
    const queued = await enqueueUpload(options);

    let current = queued;
    let result: UploadResult = { url: "", success: false };

    while (current.retryCount < MAX_RETRY) {
      result = await runUploadAttempt(current, options.onProgress);

      if (result.success) {
        return result;
      }

      const queue = await readUploadQueue();
      const updated = queue.find((item) => item.id === current.id);

      if (!updated) {
        return { url: "", success: false };
      }

      current = updated;
    }

    return result;
  },

  async retryUpload(
    queueItemId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const queue = await readUploadQueue();
    const item = queue.find((entry) => entry.id === queueItemId);

    if (!item) {
      return { url: "", success: false };
    }

    if (item.retryCount >= MAX_RETRY) {
      return { url: "", success: false };
    }

    return runUploadAttempt(item, onProgress);
  },

  async getUploadQueue(): Promise<MediaQueueItem[]> {
    return readUploadQueue();
  },

  async clearUploadedQueueItems(): Promise<void> {
    const queue = await readUploadQueue();
    const pending = queue.filter((item) => item.uploadStatus !== "uploaded");
    await writeUploadQueue(pending);
  },

  async removeUploadQueueItem(queueItemId: string): Promise<void> {
    await removeQueueItem(queueItemId);
  },

  async download(
    mediaId: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const existing = await readDownloadCache();
    const hit = existing.find((item) => item.mediaId === mediaId);

    if (hit?.downloadStatus === "downloaded") {
      onProgress?.(1);
      return true;
    }

    let progress = 0;

    while (progress < 1) {
      progress = Math.min(progress + 0.2, 1);
      onProgress?.(progress);
      await wait(150);
    }

    const nextEntry: MediaCacheEntry = {
      mediaId,
      remoteUrl: mediaId,
      cachedUri: mediaId,
      downloadedAt: Date.now(),
      downloadStatus: "downloaded",
    };

    const others = existing.filter((item) => item.mediaId !== mediaId);
    others.push(nextEntry);
    await writeDownloadCache(others);

    return true;
  },

  async getDownloadCache(): Promise<MediaCacheEntry[]> {
    return readDownloadCache();
  },

  async isDownloaded(mediaId: string): Promise<boolean> {
    const cache = await readDownloadCache();
    return cache.some(
      (item) =>
        item.mediaId === mediaId && item.downloadStatus === "downloaded"
    );
  },

  async clearDownloadCache(): Promise<void> {
    await writeDownloadCache([]);
  },

  async getPerChatStorage(
    chats: Array<{ id: string; title?: string }>
  ): Promise<
    Array<{
      chatId: string;
      title: string;
      totalMB: number;
      mediaMB: number;
      videosMB: number;
      filesMB: number;
    }>
  > {
    let map = await readPerChatStorage();
    if (chats.length > 0 && Object.keys(map).length === 0) {
      const seed: Record<string, PerChatStorageBreakdown> = {};
      chats.forEach((c, i) => {
        seed[c.id] = {
          mediaMB: 12 + (i % 5) * 4,
          videosMB: 5 + (i % 3) * 3,
          filesMB: (i % 2) * 2,
        };
      });
      await writePerChatStorage(seed);
      map = seed;
    }
    return chats.map((c) => {
      const b = map[c.id] ?? defaultBreakdown();
      const totalMB = b.mediaMB + b.videosMB + b.filesMB;
      return {
        chatId: c.id,
        title: c.title ?? c.id,
        totalMB,
        mediaMB: b.mediaMB,
        videosMB: b.videosMB,
        filesMB: b.filesMB,
      };
    });
  },

  async getChatStorageDetails(chatId: string): Promise<PerChatStorageBreakdown> {
    const map = await readPerChatStorage();
    return map[chatId] ?? defaultBreakdown();
  },

  async cleanChatMedia(chatId: string): Promise<void> {
    const map = await readPerChatStorage();
    const current = map[chatId] ?? defaultBreakdown();
    map[chatId] = {
      ...current,
      mediaMB: 0,
      videosMB: 0,
    };
    await writePerChatStorage(map);
  },

  async clearChatStorage(chatId: string): Promise<void> {
    const map = await readPerChatStorage();
    delete map[chatId];
    await writePerChatStorage(map);
  },
};
