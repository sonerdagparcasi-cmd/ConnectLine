// src/domains/chat/utils/formatLastSeen.ts
// Format lastSeenAt for display (keys for i18n)

export type LastSeenFormat =
  | { key: "chat.presence.justNow" }
  | { key: "chat.presence.minutesAgo"; m: number }
  | { key: "chat.presence.hoursAgo"; h: number }
  | { key: "chat.presence.yesterday" }
  | { key: "chat.presence.daysAgo"; d: number };

const MIN_MS = 60 * 1000;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatLastSeen(lastSeenAt: number): LastSeenFormat | null {
  if (lastSeenAt <= 0) return null;
  const now = Date.now();
  const diff = now - lastSeenAt;
  if (diff < 60 * 1000) return { key: "chat.presence.justNow" };
  if (diff < 60 * MIN_MS) return { key: "chat.presence.minutesAgo", m: Math.floor(diff / MIN_MS) };
  if (diff < 24 * HOUR_MS) return { key: "chat.presence.hoursAgo", h: Math.floor(diff / HOUR_MS) };
  const todayStartDate = new Date(now);
  todayStartDate.setHours(0, 0, 0, 0);
  const todayStart = todayStartDate.getTime();
  const yesterdayStart = todayStart - DAY_MS;
  if (lastSeenAt >= yesterdayStart && lastSeenAt < todayStart) return { key: "chat.presence.yesterday" };
  return { key: "chat.presence.daysAgo", d: Math.floor(diff / DAY_MS) };
}

export function formatLastSeenLabel(
  f: LastSeenFormat | null,
  tFn: (key: string) => string
): string {
  if (!f) return "";
  let s = tFn(f.key);
  if ("m" in f && f.m != null) s = s.replace("{{m}}", String(f.m));
  if ("h" in f && f.h != null) s = s.replace("{{h}}", String(f.h));
  if ("d" in f && f.d != null) s = s.replace("{{d}}", String(f.d));
  return s;
}
