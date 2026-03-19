// src/domains/store/screens/StoreEventPageScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import StoreErrorState from "../components/StoreErrorState";
import StoreListLoading from "../components/StoreListLoading";
import type { StoreStackParamList } from "../navigation/StoreNavigator";
import { getCampaignStatus, storeCampaignService } from "../services/storeCampaignService";
import type { StoreCampaign } from "../types/storeCampaign.types";

type R = RouteProp<StoreStackParamList, "StoreEventPage">;

function toMs(iso: string) {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const dd = days > 0 ? `${days}g ` : "";
  const hh = String(hours).padStart(2, "0");
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return `${dd}${hh}:${mm}:${ss}`;
}

export default function StoreEventPageScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<R>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<StoreCampaign | null>(null);

  const [nowTick, setNowTick] = useState(Date.now());
  const [participantCount, setParticipantCount] = useState<number>(0);

  const status = useMemo(() => (campaign ? getCampaignStatus(campaign) : "upcoming"), [campaign]);

  const countdownMs = useMemo(() => {
    if (!campaign) return 0;
    const start = toMs(campaign.startsAt);
    const end = toMs(campaign.endsAt);

    if (status === "upcoming") return Math.max(0, start - nowTick);
    if (status === "active") return Math.max(0, end - nowTick);
    return 0;
  }, [campaign, nowTick, status]);

  const countdownLabel = useMemo(() => {
    if (!campaign) return "";
    if (status === "upcoming") return "Başlamasına kalan";
    if (status === "active") return "Bitmesine kalan";
    return "Etkinlik bitti";
  }, [campaign, status]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.campaignId]);

  useEffect(() => {
    const h = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(h);
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const c = await storeCampaignService.getCampaignById(route.params.campaignId);
      setCampaign(c);

      if (!c) {
        setParticipantCount(0);
        setError("Etkinlik bulunamadı.");
        return;
      }

      const cnt = await storeCampaignService.getParticipantCount(c.id);
      setParticipantCount(cnt);
    } catch {
      setError("Etkinlik yüklenemedi.");
      setCampaign(null);
      setParticipantCount(0);
    } finally {
      setLoading(false);
    }
  }

  async function onJoin() {
    if (!campaign) return;

    try {
      await storeCampaignService.joinEvent(campaign.id);
      const cnt = await storeCampaignService.getParticipantCount(campaign.id);
      setParticipantCount(cnt);
      Alert.alert("Katılım", "Etkinliğe katıldınız (mock).");
    } catch {
      Alert.alert("Hata", "Katılım işlemi başarısız.");
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
        <StoreListLoading title="Etkinlik yükleniyor..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
        <StoreErrorState title={error} onRetry={load} />
      </View>
    );
  }

  if (!campaign) return null;

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title="Etkinlik"
        onBack={() => nav.goBack()}
        right={
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => nav.navigate("StoreCampaignDetail", { campaignId: campaign.id })}
            style={{ padding: 8, flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name="open-outline" size={18} color={T.isDark ? "#fff" : "#000"} />
            <Text style={[styles.backText, { color: T.isDark ? "#fff" : "#000" }]}>Detay</Text>
          </TouchableOpacity>
        }
      />

      <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
        <Text style={[styles.eventTitle, { color: T.textColor }]} numberOfLines={2}>
          {(campaign.bannerEmoji ? `${campaign.bannerEmoji} ` : "") + campaign.title}
        </Text>

        <Text style={[styles.desc, { color: T.mutedText }]}>{campaign.description}</Text>

        <View style={[styles.timerBox, { borderColor: T.border }]}>
          <Text style={[styles.timerLabel, { color: T.mutedText }]}>{countdownLabel}</Text>
          <Text style={[styles.timerValue, { color: T.textColor }]}>
            {status === "ended" ? "00:00:00" : formatCountdown(countdownMs)}
          </Text>

          {!!campaign.discount?.percent && (
            <Text style={[styles.discount, { color: T.textColor }]}>
              İndirim: %{campaign.discount.percent}
            </Text>
          )}
        </View>

        <View style={[styles.metaRow, { borderColor: T.border }]}>
          <Text style={[styles.metaText, { color: T.mutedText }]}>
            Katılımcı (mock): {participantCount}
          </Text>

          <View style={[styles.statusPill, { borderColor: T.border }]}>
            <Text style={[styles.statusText, { color: T.mutedText }]}>
              {status === "active" ? "Aktif" : status === "upcoming" ? "Yakında" : "Bitti"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onJoin}
          disabled={status !== "active"}
          style={[
            styles.joinBtn,
            {
              borderColor: T.border,
              opacity: status === "active" ? 1 : 0.45,
            },
          ]}
        >
          <Ionicons name="enter-outline" size={18} color={T.textColor} />
          <Text style={[styles.joinText, { color: T.textColor }]}>Katıl (Mock)</Text>
        </TouchableOpacity>

        {status !== "active" && (
          <Text style={[styles.note, { color: T.mutedText }]}>
            Katılım sadece etkinlik aktifken açılır.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 14, paddingHorizontal: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "900" },

  backBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: { fontSize: 12, fontWeight: "900" },

  card: { marginTop: 10, borderWidth: 1, borderRadius: 18, padding: 12, gap: 10 },
  eventTitle: { fontSize: 16, fontWeight: "900" },
  desc: { fontSize: 12, fontWeight: "700", lineHeight: 16 },

  timerBox: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 6 },
  timerLabel: { fontSize: 12, fontWeight: "800" },
  timerValue: { fontSize: 22, fontWeight: "900" },
  discount: { fontSize: 12, fontWeight: "900" },

  metaRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  metaText: { fontSize: 12, fontWeight: "800" },
  statusPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: "900" },

  joinBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  joinText: { fontSize: 13, fontWeight: "900" },

  note: { fontSize: 12, fontWeight: "700", lineHeight: 16 },
});