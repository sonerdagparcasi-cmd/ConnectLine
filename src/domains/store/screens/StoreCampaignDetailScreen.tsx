import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import StoreErrorState from "../components/StoreErrorState";
import StoreListLoading from "../components/StoreListLoading";
import type { StoreStackParamList } from "../navigation/StoreNavigator";
import {
  getCampaignStatus,
  storeCampaignService,
} from "../services/storeCampaignService";
import { storeShareService } from "../services/storeShareService";
import type { StoreCampaign } from "../types/storeCampaign.types";

type R = RouteProp<StoreStackParamList, "StoreCampaignDetail">;

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function StoreCampaignDetailScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<R>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<StoreCampaign | null>(null);
  const [inviteCount, setInviteCount] = useState(0);

  const status = useMemo(
    () => (campaign ? getCampaignStatus(campaign) : "upcoming"),
    [campaign]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.campaignId]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const c = await storeCampaignService.getCampaignById(
        params.campaignId
      );

      if (!c) {
        setError(t("store.campaignDetail.notFound"));
        setCampaign(null);
        setInviteCount(0);
        return;
      }

      setCampaign(c);
      const count = await storeCampaignService.getInviteCount(c.id);
      setInviteCount(count);
    } catch {
      setError(t("store.campaignDetail.error"));
      setCampaign(null);
      setInviteCount(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!campaign) return;

    const text = buildInviteText(campaign);
    await storeShareService.copyText(text);
    await storeCampaignService.createInvite({
      campaignId: campaign.id,
      channel: "copy",
    });

    const count = await storeCampaignService.getInviteCount(campaign.id);
    setInviteCount(count);

    Alert.alert(
      t("store.common.copyDone"),
      t("store.common.copyDone.desc")
    );
  }

  async function handleShare() {
    if (!campaign) return;

    const text = buildInviteText(campaign);

    await storeShareService.shareText({
      title: campaign.title,
      message: text,
      url: `connectline://store/campaign/${campaign.id}`,
    });

    await storeCampaignService.createInvite({
      campaignId: campaign.id,
      channel: "share",
    });

    const count = await storeCampaignService.getInviteCount(campaign.id);
    setInviteCount(count);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <StoreListLoading />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <StoreErrorState title={error} onRetry={load} />
      </View>
    );
  }

  if (!campaign) return null;

  return (
    <ScrollView
      style={{ backgroundColor: T.backgroundColor }}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
        <Text style={[styles.title, { color: T.textColor }]}>
          {campaign.bannerEmoji ? `${campaign.bannerEmoji} ` : ""}
          {campaign.title}
        </Text>

        {!!campaign.subtitle && (
          <Text style={[styles.sub, { color: T.mutedText }]}>
            {campaign.subtitle}
          </Text>
        )}

        {!!campaign.description && (
          <Text style={[styles.desc, { color: T.mutedText }]}>
            {campaign.description}
          </Text>
        )}

        <View style={[styles.meta, { borderColor: T.border }]}>
          <Text style={[styles.metaText, { color: T.mutedText }]}>
            {t("store.campaignDetail.status")}: {status}
          </Text>

          <Text style={[styles.metaText, { color: T.mutedText }]}>
            {t("store.campaignDetail.starts")}:{" "}
            {formatDate(campaign.startsAt)}
          </Text>

          <Text style={[styles.metaText, { color: T.mutedText }]}>
            {t("store.campaignDetail.ends")}:{" "}
            {formatDate(campaign.endsAt)}
          </Text>

          {!!campaign.discount?.percent && (
            <Text style={[styles.metaStrong, { color: T.textColor }]}>
              {t("store.campaignDetail.discount")}: %
              {campaign.discount.percent}
            </Text>
          )}

          <Text style={[styles.metaText, { color: T.mutedText }]}>
            {t("store.campaignDetail.inviteCount")}: {inviteCount}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleCopy}
            style={[styles.actionBtn, { borderColor: T.border }]}
          >
            <Ionicons name="copy-outline" size={18} color={T.textColor} />
            <Text style={[styles.actionText, { color: T.textColor }]}>
              {t("store.campaignDetail.copy")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={[styles.actionBtn, { borderColor: T.border }]}
          >
            <Ionicons name="share-social-outline" size={18} color={T.textColor} />
            <Text style={[styles.actionText, { color: T.textColor }]}>
              {t("store.campaignDetail.share")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              nav.navigate("StoreCampaignNotifications")
            }
            style={[styles.secondaryBtn, { borderColor: T.border }]}
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={T.textColor}
            />
            <Text style={[styles.actionText, { color: T.textColor }]}>
              {t("store.campaigns.notifications")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function buildInviteText(c: StoreCampaign) {
  return [
    c.title,
    c.subtitle ?? "",
    c.description ?? "",
    `Starts: ${c.startsAt}`,
    `Ends: ${c.endsAt}`,
    `Link: connectline://store/campaign/${c.id}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  title: { fontSize: 16, fontWeight: "900" },
  sub: { fontSize: 13, fontWeight: "800" },
  desc: { fontSize: 12, fontWeight: "700", lineHeight: 16 },

  meta: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  metaText: { fontSize: 12, fontWeight: "700" },
  metaStrong: { fontSize: 12, fontWeight: "900" },

  actions: { gap: 10, marginTop: 8 },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: { fontSize: 13, fontWeight: "900" },
});