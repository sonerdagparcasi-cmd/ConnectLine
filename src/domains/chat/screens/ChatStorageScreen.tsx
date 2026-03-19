// src/domains/chat/screens/ChatStorageScreen.tsx
// Total storage, media usage, per-chat cleanup, clear chat

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import { useChatList } from "../hooks/useChatList";
import {
  chatMediaService,
  type PerChatStorageBreakdown,
} from "../services/chatMediaService";

const MOCK_TOTAL_MB = 128;
const MOCK_MEDIA_MB = 86;

type PerChatRow = {
  chatId: string;
  title: string;
  totalMB: number;
  mediaMB: number;
  videosMB: number;
  filesMB: number;
};

export default function ChatStorageScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const { chats } = useChatList();

  const [clearing, setClearing] = useState(false);
  const [perChatList, setPerChatList] = useState<PerChatRow[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatTitle, setSelectedChatTitle] = useState("");
  const [detailBreakdown, setDetailBreakdown] = useState<PerChatStorageBreakdown | null>(null);

  const loadPerChat = useCallback(async () => {
    const list = await chatMediaService.getPerChatStorage(
      chats.map((c) => ({ id: c.id, title: c.title }))
    );
    setPerChatList(list);
  }, [chats]);

  useEffect(() => {
    loadPerChat();
  }, [loadPerChat]);

  useEffect(() => {
    if (!selectedChatId) {
      setDetailBreakdown(null);
      return;
    }
    chatMediaService.getChatStorageDetails(selectedChatId).then(setDetailBreakdown);
  }, [selectedChatId]);

  const handleClearChat = () => {
    Alert.alert(
      t("chat.storage.clearChat"),
      t("chat.storage.clearConfirm"),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setClearing(true);
            setTimeout(() => setClearing(false), 1000);
          },
        },
      ]
    );
  };

  const openDetail = (row: PerChatRow) => {
    setSelectedChatId(row.chatId);
    setSelectedChatTitle(row.title);
  };

  const closeDetail = () => {
    setSelectedChatId(null);
    setSelectedChatTitle("");
  };

  const handleCleanMedia = () => {
    if (!selectedChatId) return;
    Alert.alert(
      t("chat.storage.cleanMedia"),
      t("chat.storage.cleanMediaConfirm"),
      [
        { text: t("chat.profile.cancel"), style: "cancel" },
        {
          text: t("chat.storage.cleanMedia"),
          style: "destructive",
          onPress: async () => {
            await chatMediaService.cleanChatMedia(selectedChatId);
            const next = await chatMediaService.getChatStorageDetails(selectedChatId);
            setDetailBreakdown(next);
            loadPerChat();
          },
        },
      ]
    );
  };

  const handleClearChatStorage = () => {
    if (!selectedChatId) return;
    Alert.alert(
      t("chat.storage.clearChatStorage"),
      t("chat.storage.clearStorageConfirm"),
      [
        { text: t("chat.profile.cancel"), style: "cancel" },
        {
          text: t("chat.storage.clearChatStorage"),
          style: "destructive",
          onPress: async () => {
            await chatMediaService.clearChatStorage(selectedChatId);
            closeDetail();
            loadPerChat();
          },
        },
      ]
    );
  };

  const overlayBg = T.isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.35)";

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title={t("chat.storage.title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <Text style={[styles.cardLabel, { color: T.mutedText }]}>{t("chat.storage.total")}</Text>
          <Text style={[styles.cardValue, { color: T.textColor }]}>{MOCK_TOTAL_MB} MB</Text>
        </View>
        <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <Text style={[styles.cardLabel, { color: T.mutedText }]}>{t("chat.storage.media")}</Text>
          <Text style={[styles.cardValue, { color: T.textColor }]}>{MOCK_MEDIA_MB} MB</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: T.mutedText }]}>
          {t("chat.storage.perChat")}
        </Text>
        <FlatList
          data={perChatList}
          keyExtractor={(item) => item.chatId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderColor: T.border }]}
              onPress={() => openDetail(item)}
            >
              <Text style={[styles.rowLabel, { color: T.textColor }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.rowValue, { color: T.mutedText }]}>
                {item.totalMB} MB
              </Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          style={[styles.clearBtn, { backgroundColor: T.cardBg, borderColor: T.border }]}
          onPress={handleClearChat}
          disabled={clearing}
        >
          <Ionicons name="trash-outline" size={22} color={C.danger} />
          <Text style={[styles.clearLabel, { color: C.danger }]}>
            {t("chat.storage.clearChat")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!selectedChatId} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
          <View style={[styles.detailCard, { backgroundColor: T.backgroundColor }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: T.textColor }]} numberOfLines={1}>
                {selectedChatTitle}
              </Text>
              <TouchableOpacity onPress={closeDetail}>
                <Ionicons name="close" size={24} color={T.textColor} />
              </TouchableOpacity>
            </View>
            {detailBreakdown && (
              <View style={styles.detailCategories}>
                <View style={[styles.categoryRow, { borderColor: T.border }]}>
                  <Text style={[styles.categoryLabel, { color: T.textColor }]}>
                    {t("chat.storage.mediaCategory")}
                  </Text>
                  <Text style={[styles.categoryValue, { color: T.mutedText }]}>
                    {detailBreakdown.mediaMB} MB
                  </Text>
                </View>
                <View style={[styles.categoryRow, { borderColor: T.border }]}>
                  <Text style={[styles.categoryLabel, { color: T.textColor }]}>
                    {t("chat.storage.videosCategory")}
                  </Text>
                  <Text style={[styles.categoryValue, { color: T.mutedText }]}>
                    {detailBreakdown.videosMB} MB
                  </Text>
                </View>
                <View style={[styles.categoryRow, { borderColor: T.border }]}>
                  <Text style={[styles.categoryLabel, { color: T.textColor }]}>
                    {t("chat.storage.filesCategory")}
                  </Text>
                  <Text style={[styles.categoryValue, { color: T.mutedText }]}>
                    {detailBreakdown.filesMB} MB
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={[styles.detailActionBtn, { backgroundColor: T.cardBg, borderColor: T.border }]}
              onPress={handleCleanMedia}
            >
              <Ionicons name="images-outline" size={20} color={T.textColor} />
              <Text style={[styles.detailActionLabel, { color: T.textColor }]}>
                {t("chat.storage.cleanMedia")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.detailActionBtn, { backgroundColor: T.cardBg, borderColor: T.border }]}
              onPress={handleClearChatStorage}
            >
              <Ionicons name="trash-outline" size={20} color={C.danger} />
              <Text style={[styles.detailActionLabel, { color: C.danger }]}>
                {t("chat.storage.clearChatStorage")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 13, marginBottom: 4 },
  cardValue: { fontSize: 22, fontWeight: "800" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowLabel: { fontSize: 15, fontWeight: "600", flex: 1 },
  rowValue: { fontSize: 14, marginLeft: 8 },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
  },
  clearLabel: { fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  detailCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 16,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailTitle: { fontSize: 18, fontWeight: "800", flex: 1 },
  detailCategories: { marginBottom: 16 },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  categoryLabel: { fontSize: 15, fontWeight: "600" },
  categoryValue: { fontSize: 14 },
  detailActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  detailActionLabel: { fontSize: 15, fontWeight: "600" },
});
