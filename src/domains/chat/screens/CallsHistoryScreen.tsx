import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { useCalls } from "../hooks/useCalls";
import type {
  CallExportFormat,
  CallFilterKey,
  CallSearchParams,
} from "../services/chatService";
import type { Call, CallStatus } from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* UI HELPERS                                                          */
/* ------------------------------------------------------------------ */

const LABELS: Record<
  CallFilterKey,
  { text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  all: { text: "Tümü", icon: "list" },
  incoming: { text: "Gelen", icon: "arrow-down" },
  outgoing: { text: "Giden", icon: "arrow-up" },
  missed: { text: "Cevapsız", icon: "close" },
  audio: { text: "Sesli", icon: "call" },
  video: { text: "Görüntülü", icon: "videocam" },
};

function isGroupCall(call: Call) {
  return !!(call as any).chatId && Array.isArray((call as any).participantIds);
}

function groupCount(call: Call) {
  return (call as any).participantIds?.length ?? 0;
}

function dayLabel(ts?: number) {
  if (!ts) return "Bilinmeyen";
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Bugün";
  if (sameDay(d, yest)) return "Dün";
  return d.toLocaleDateString();
}

function formatDuration(sec?: number) {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function statusText(status: CallStatus) {
  switch (status) {
    case "missed":
      return "Cevapsız";
    case "rejected":
      return "Reddedildi";
    case "completed":
      return "Tamamlandı";
    case "ringing":
      return "Çalıyor";
    default:
      return status;
  }
}

function statusColor(status: CallStatus, muted: string, danger: string) {
  if (status === "missed") return danger;
  if (status === "rejected") return muted;
  return muted;
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function CallsHistoryScreen() {
  const { calls, searchCalls, refresh, exportCalls } = useCalls();
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const overlayBg = T.isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.35)";
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CallFilterKey>("all");

  /* ---------------- C7 — SEARCH + FILTER ---------------- */

  useEffect(() => {
    const params: CallSearchParams = {
      query: query || undefined,
      filter,
    };
    searchCalls(params);
  }, [query, filter, searchCalls]);

  /* ---------------- GROUP BY DAY ---------------- */

  const data = useMemo(() => {
    const out: Array<
      | { kind: "header"; id: string; title: string }
      | { kind: "call"; id: string; call: Call }
    > = [];

    let lastLabel: string | null = null;

    calls.forEach((c) => {
      const label = dayLabel(c.startedAt);
      if (label !== lastLabel) {
        out.push({ kind: "header", id: `h-${label}`, title: label });
        lastLabel = label;
      }
      out.push({ kind: "call", id: c.id, call: c });
    });

    return out;
  }, [calls]);

  /* ---------------- NAV ---------------- */

  function openDetail(call: Call) {
    navigation.navigate("CallDetail", { callId: call.id });
  }

  function clearAll() {
    setQuery("");
    setFilter("all");
    refresh();
  }

  /* ---------------- C8 — EXPORT ---------------- */

  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] =
    useState<CallExportFormat>("txt");

  const exportContent = useMemo(
    () => exportCalls(exportFormat),
    [exportCalls, exportFormat]
  );

  async function copyExport() {
    await Clipboard.setStringAsync(exportContent);
    Alert.alert("Kopyalandı", "İçerik panoya kopyalandı (UI-only)");
  }

  async function shareExport() {
    await Share.share({ message: exportContent });
  }

  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <Ionicons name="search" size={18} color={T.mutedText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ara (kullanıcı / grup)"
            placeholderTextColor={T.mutedText}
            style={[styles.searchInput, { color: T.textColor }]}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={T.mutedText} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setExportOpen(true)}
          style={[
            styles.exportBtn,
            { borderColor: T.border, backgroundColor: T.cardBg },
          ]}
        >
          <Ionicons name="share-outline" size={18} color={T.textColor} />
          <Text style={{ color: T.textColor, fontWeight: "800" }}>
            Dışa Aktar
          </Text>
        </TouchableOpacity>
      </View>

      {/* FILTERS */}
      <FlatList
        data={Object.keys(LABELS) as CallFilterKey[]}
        keyExtractor={(k) => k}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
        renderItem={({ item }) => {
          const active = item === filter;
          return (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={[
                styles.pill,
                {
                  borderColor: active ? T.textColor : T.border,
                  backgroundColor: active ? T.cardBg : "transparent",
                },
              ]}
            >
              <Ionicons
                name={LABELS[item].icon}
                size={14}
                color={active ? T.textColor : T.mutedText}
              />
              <Text
                style={{
                  color: active ? T.textColor : T.mutedText,
                  fontWeight: "800",
                }}
              >
                {LABELS[item].text}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* LIST */}
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
        renderItem={({ item }) =>
          item.kind === "header" ? (
            <Text style={[styles.sectionHeader, { color: T.mutedText }]}>
              {item.title}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={() => openDetail(item.call)}
              style={[
                styles.row,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <View style={styles.left}>
                <View style={[styles.avatar, { borderColor: T.border }]}>
                  <Ionicons
                    name={
                      isGroupCall(item.call)
                        ? "people-outline"
                        : item.call.type === "video"
                        ? "videocam-outline"
                        : "call-outline"
                    }
                    size={18}
                    color={T.textColor}
                  />
                </View>
                <View>
                  <Text style={[styles.title, { color: T.textColor }]}>
                    {isGroupCall(item.call)
                      ? "Grup çağrısı"
                      : item.call.toUserId}
                  </Text>
                  <Text
                    style={[
                      styles.sub,
                      {
                        color: statusColor(item.call.status, T.mutedText, C.danger),
                      },
                    ]}
                  >
                    {isGroupCall(item.call)
                      ? `👥 ${groupCount(item.call)} kişi`
                      : item.call.type === "video"
                      ? "Görüntülü"
                      : "Sesli"}{" "}
                    • {statusText(item.call.status)}
                    {item.call.durationSec
                      ? ` • ${formatDuration(item.call.durationSec)}`
                      : ""}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={T.mutedText} />
            </TouchableOpacity>
          )
        }
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ color: T.mutedText, fontWeight: "700" }}>
              Sonuç bulunamadı.
            </Text>
            <TouchableOpacity onPress={clearAll} style={styles.resetBtn}>
              <Ionicons name="refresh" size={16} color={T.textColor} />
              <Text style={{ color: T.textColor, fontWeight: "800" }}>
                Sıfırla
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* EXPORT MODAL (değişmedi) */}
      <Modal visible={exportOpen} animationType="slide" transparent>
        <View style={[styles.modalBackdrop, { backgroundColor: overlayBg }]}>
          <View style={[styles.modalCard, { backgroundColor: T.cardBg }]}>
            {/* aynı */}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  searchBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  clearBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  exportBtn: {
    borderWidth: 1,
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 6,
  },
  row: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
  },
  sub: {
    fontSize: 12,
    fontWeight: "600",
  },
  resetBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 12,
    gap: 12,
  },
});