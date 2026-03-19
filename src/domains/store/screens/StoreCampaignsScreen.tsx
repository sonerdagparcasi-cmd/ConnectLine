// src/domains/store/screens/StoreCampaignsScreen.tsx
// 🔒 STORE CAMPAIGNS – STABLE + LIVE COMMERCE ENTRY

import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import CampaignFilterBar from "../components/CampaignFilterBar";

import {
  filterAndSortCampaigns,
  type CampaignSort,
  type CampaignStatusFilter,
} from "../services/storeCampaignFilters";

import { storeCampaignService } from "../services/storeCampaignService";

import type { StoreCampaign } from "../types/storeCampaign.types";

export default function StoreCampaignsScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StoreCampaign[]>([]);
  const [status, setStatus] = useState<CampaignStatusFilter>("all");
  const [sort, setSort] = useState<CampaignSort>("discount_desc");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const list = await storeCampaignService.getCampaigns();
    setItems(list);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return filterAndSortCampaigns(items, { status, sort });
  }, [items, status, sort]);

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Kampanyalar
      </Text>

      {/* -------------------------------------------------- */}
      {/* 🔴 LIVE COMMERCE ENTRY                            */}
      {/* -------------------------------------------------- */}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => nav.navigate("StoreLiveCommerce")}
        style={[
          styles.liveCard,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <Text style={[styles.liveTitle, { color: T.textColor }]}>
          🔴 Canlı Alışveriş
        </Text>

        <Text style={{ color: T.mutedText, fontSize: 12, fontWeight: "700" }}>
          Satıcıların canlı yayınlarını izle ve ürünü anında satın al
        </Text>
      </TouchableOpacity>

      {/* -------------------------------------------------- */}

      <CampaignFilterBar
        status={status}
        sort={sort}
        onChangeStatus={setStatus}
        onChangeSort={setSort}
      />

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: T.mutedText }}>
            Yükleniyor…
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: T.mutedText }}>
                Kampanya bulunamadı.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                nav.navigate("StoreCampaignDetail", {
                  campaignId: item.id,
                })
              }
              style={[
                styles.card,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: T.textColor }]}>
                {(item.bannerEmoji ? `${item.bannerEmoji} ` : "🎉 ") +
                  item.title}
              </Text>

              {!!item.subtitle && (
                <Text
                  style={{
                    color: T.mutedText,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  {item.subtitle}
                </Text>
              )}

              {!!item.badgeText && (
                <Text
                  style={{
                    color: T.accent,
                    fontSize: 12,
                    fontWeight: "900",
                  }}
                >
                  {item.badgeText}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  liveCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    gap: 4,
  },

  liveTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
});