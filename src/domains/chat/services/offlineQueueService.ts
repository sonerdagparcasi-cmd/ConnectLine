// src/domains/chat/services/offlineQueueService.ts
// Offline message queue: persist to AsyncStorage when there is no internet.

import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "chat_offline_queue";

export type QueuedMessage = {
  id: string;
  chatId: string;
  text?: string;
  replyTo?: { messageId: string; preview: string; mine: boolean };
  createdAt: number;
  [key: string]: unknown;
};

async function readQueue(): Promise<QueuedMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(messages: QueuedMessage[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(messages));
}

/**
 * Add a message to the offline queue and persist to AsyncStorage.
 */
export async function addMessageToQueue(message: QueuedMessage): Promise<void> {
  const queue = await readQueue();
  queue.push(message);
  await writeQueue(queue);
}

/**
 * Return all messages currently in the offline queue.
 */
export async function getQueuedMessages(): Promise<QueuedMessage[]> {
  return readQueue();
}

/**
 * For each queued message, call sendMessageFn. On success, remove from queue and persist.
 * Failed sends leave the message in the queue.
 */
export async function flushQueue(
  sendMessageFn: (message: QueuedMessage) => Promise<void>
): Promise<void> {
  const queue = await readQueue();
  const remaining: QueuedMessage[] = [];

  for (const message of queue) {
    try {
      await sendMessageFn(message);
    } catch {
      remaining.push(message);
    }
  }

  await writeQueue(remaining);
}
