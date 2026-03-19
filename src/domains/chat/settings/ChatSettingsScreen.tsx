import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import { useChatSettings } from "../hooks/useChatSettings";
import { chatMediaService } from "../services/chatMediaService";
import { chatMediaPicker } from "../services/chatMediaPicker";

/**
 * ChatSettingsScreen
 * - Chat domain only
 * - Gerçek ayarlar (service + hook)
 * - Profil ile state paylaşmaz (tek source ChatProfile)
 * - Header geri butonu YOK (kilitli karar)
 * - Mimari KİLİTLİ
 */

const WALLPAPER_COLORS = ["#f5f5f5", "#e3f2fd", "#1a1a2e", "#2d1b4e"];

export default function ChatSettingsScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const overlayBg = T.isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.35)";
  const navigation = useNavigation<any>();
  const { settings, update } = useChatSettings();

  const [blockedOpen, setBlockedOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [wallpaperOpen, setWallpaperOpen] = useState(false);

  const blocked = settings.blockedUsers;

  const unblockUser = (id: string) => {
    update({
      blockedUsers: blocked.filter((x) => x !== id),
    });
  };

  const handleClearConfirm = async () => {
    setClearConfirmOpen(false);
    await chatMediaService.clearDownloadCache();
  };

  /* ------------------ SWIPE DOWN ------------------ */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) setBlockedOpen(false);
      },
    })
  ).current;

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title={t("chat.settings.title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Section title={t("chat.privacy.title")} T={T} />
        <TouchableOpacity
          style={[styles.row, { borderColor: T.border }]}
          onPress={() => navigation.navigate("ChatPrivacy")}
        >
          <Text style={[styles.rowLabel, { color: T.textColor }]}>{t("chat.privacy.title")}</Text>
          <Ionicons name="chevron-forward" size={18} color={T.mutedText} />
        </TouchableOpacity>

        <Section title={t("chat.settings.notifications")} T={T} />

        <SettingRow
          label={t("chat.settings.notificationsEnable")}
          value={settings.notificationsEnabled}
          onChange={(v) => update({ notificationsEnabled: v })}
          T={T}
          thumbColor={C.buttonText}
        />

        <SettingRow
          label={t("chat.settings.sound")}
          value={settings.notificationSound}
          onChange={(v) => update({ notificationSound: v })}
          T={T}
          thumbColor={C.buttonText}
        />

        <SettingRow
          label={t("chat.settings.vibration")}
          value={settings.notificationVibration}
          onChange={(v) => update({ notificationVibration: v })}
          T={T}
          thumbColor={C.buttonText}
        />

        <Section title={t("chat.settings.sectionChat")} T={T} />

        <SettingRow
          label={t("chat.settings.autoPlayVoice")}
          value={settings.autoPlayVoice}
          onChange={(v) => update({ autoPlayVoice: v })}
          T={T}
          thumbColor={C.buttonText}
        />

        <SettingRow
          label={t("chat.settings.mediaAutoDownload")}
          value={settings.autoDownloadMedia}
          onChange={(v) => update({ autoDownloadMedia: v })}
          T={T}
          thumbColor={C.buttonText}
        />

        <Section title={t("chat.settings.appearance")} T={T} />
        <View style={[styles.row, styles.fontSizeRow, { borderColor: T.border }]}>
          <Text style={[styles.rowLabel, { color: T.textColor }]}>{t("chat.settings.fontSize")}</Text>
          <View style={styles.chipRow}>
            {(["small", "medium", "large"] as const).map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => update({ fontSize: size })}
                style={[
                  styles.chip,
                  { borderColor: T.border, backgroundColor: settings.fontSize === size ? T.accent : T.cardBg },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: settings.fontSize === size ? C.buttonText : T.textColor },
                  ]}
                >
                  {size === "small"
                    ? t("chat.settings.fontSmall")
                    : size === "medium"
                    ? t("chat.settings.fontMedium")
                    : t("chat.settings.fontLarge")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.row, { borderColor: T.border }]}
          onPress={() => setWallpaperOpen(true)}
        >
          <Text style={[styles.rowLabel, { color: T.textColor }]}>{t("chat.settings.wallpaper")}</Text>
          <View style={styles.wallpaperPreviewRow}>
            <WallpaperPreview settings={settings} T={T} />
            <Ionicons name="chevron-forward" size={18} color={T.mutedText} />
          </View>
        </TouchableOpacity>

        <Section title={t("chat.settings.backup")} T={T} />
        <View style={[styles.row, { borderColor: T.border }]}>
          <Text style={[styles.rowLabel, { color: T.mutedText }]}>{t("chat.settings.backupPlaceholder")}</Text>
        </View>

        <Section title={t("chat.storage.title")} T={T} />
        <TouchableOpacity
          style={[styles.row, { borderColor: T.border }]}
          onPress={() => navigation.navigate("ChatStorage")}
        >
          <Text style={[styles.rowLabel, { color: T.textColor }]}>{t("chat.settings.storage")}</Text>
          <Ionicons name="chevron-forward" size={18} color={T.mutedText} />
        </TouchableOpacity>

        <Section title={t("chat.settings.sectionSecurity")} T={T} />

        <ActionRow
          label={`${t("chat.privacy.blockedUsers")} (${blocked.length})`}
          icon="ban"
          T={T}
          onPress={() => setBlockedOpen(true)}
        />

        <ActionRow
          label={t("chat.storage.clearChat")}
          icon="trash-outline"
          danger
          dangerColor={C.danger}
          T={T}
          onPress={() => setClearConfirmOpen(true)}
        />
      </ScrollView>

      {/* ENGELLENENLER */}
      <Modal visible={blockedOpen} transparent animationType="fade">
        <View style={[styles.sheetOverlay, { backgroundColor: overlayBg }]}>
          <View
            {...panResponder.panHandlers}
            style={[
              styles.sheetContainer,
              { backgroundColor: T.backgroundColor },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: T.border }]} />

            <Header
              title={t("chat.privacy.blockedUsers")}
              onClose={() => setBlockedOpen(false)}
              T={T}
            />

            {blocked.length === 0 ? (
              <Text style={[styles.blockedEmpty, { color: T.mutedText }]}>
                {t("chat.settings.blockedEmpty")}
              </Text>
            ) : (
              blocked.map((userId) => (
                <TouchableOpacity
                  key={userId}
                  onPress={() => unblockUser(userId)}
                  style={[styles.row, styles.blockedRow, { borderColor: T.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rowLabel, { color: T.textColor }]} numberOfLines={1}>
                    {userId}
                  </Text>
                  <Ionicons name="remove-circle-outline" size={20} color={T.mutedText} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>

      {/* WALLPAPER */}
      <Modal visible={wallpaperOpen} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
          <View style={[styles.modalBox, { backgroundColor: T.backgroundColor }]}>
            <Header
              title={t("chat.settings.wallpaper")}
              onClose={() => setWallpaperOpen(false)}
              T={T}
            />
            <TouchableOpacity
              style={[styles.row, { borderColor: T.border }]}
              onPress={() => {
                update({ wallpaper: "none" });
                setWallpaperOpen(false);
              }}
            >
              <Text style={[styles.rowLabel, { color: T.textColor }]}>{t("chat.settings.wallpaperNone")}</Text>
            </TouchableOpacity>
            <View style={[styles.row, styles.wallpaperColors, { borderColor: T.border }]}>
              <Text style={[styles.rowLabel, { color: T.textColor }]}>{t("chat.settings.wallpaperColor")}</Text>
              <View style={styles.colorRow}>
                {WALLPAPER_COLORS.map((color) => {
                  const isSelected =
                    settings.wallpaper !== "none" &&
                    settings.wallpaper.type === "color" &&
                    settings.wallpaper.value === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      onPress={() => {
                        update({ wallpaper: { type: "color", value: color } });
                        setWallpaperOpen(false);
                      }}
                      style={[styles.colorChip, { backgroundColor: color }]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color={color === "#1a1a2e" || color === "#2d1b4e" ? "#fff" : "#333"} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.row, { borderColor: T.border }]}
              onPress={async () => {
                const picked = await chatMediaPicker.pickImageFromGallery();
                if (picked) {
                  update({ wallpaper: { type: "image", uri: picked.uri } });
                  setWallpaperOpen(false);
                }
              }}
            >
              <Ionicons name="images" size={20} color={T.textColor} />
              <Text style={[styles.rowLabel, { color: T.textColor, marginLeft: 8 }]}>
                {t("chat.settings.wallpaperGallery")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CLEAR CONFIRM */}
      <Modal transparent visible={clearConfirmOpen}>
        <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
          <View style={[styles.modalBox, { backgroundColor: T.cardBg }]}>
            <Text style={[styles.modalTitle, { color: T.textColor }]}>
              {t("chat.storage.clearConfirm")}
            </Text>
            <Text style={{ color: T.mutedText }}>
              {t("chat.settings.clearConfirmDetail")}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setClearConfirmOpen(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={{ color: T.textColor }}>{t("chat.profile.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearConfirm} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={{ color: C.danger, fontWeight: "700" }}>
                  {t("chat.settings.clearConfirmAction")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= HELPERS ================= */

function WallpaperPreview({ settings, T }: { settings: { wallpaper: any }; T: any }) {
  const w = settings.wallpaper;
  if (w === "none" || !w) {
    return (
      <View style={[styles.wallpaperPreviewCircle, { backgroundColor: T.border }]} />
    );
  }
  if (w.type === "color") {
    return (
      <View style={[styles.wallpaperPreviewCircle, { backgroundColor: w.value }]} />
    );
  }
  if (w.type === "image" && w.uri) {
    return (
      <View style={[styles.wallpaperPreviewCircle, { backgroundColor: T.border, overflow: "hidden" }]}>
        <Image source={{ uri: w.uri }} style={styles.wallpaperPreviewImg} />
      </View>
    );
  }
  return (
    <View style={[styles.wallpaperPreviewCircle, { backgroundColor: T.border }]} />
  );
}

function Section({ title, T }: { title: string; T: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: T.mutedText }]}>
      {title}
    </Text>
  );
}

function SettingRow({
  label,
  value,
  onChange,
  T,
  thumbColor,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  T: any;
  thumbColor: string;
}) {
  return (
    <View style={[styles.row, { borderColor: T.border }]}>
      <Text style={[styles.rowLabel, { color: T.textColor }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: T.border, true: T.accent }}
        thumbColor={thumbColor}
      />
    </View>
  );
}

function ActionRow({
  label,
  icon,
  danger,
  dangerColor,
  onPress,
  T,
}: {
  label: string;
  icon: any;
  danger?: boolean;
  dangerColor?: string;
  onPress: () => void;
  T: any;
}) {
  const iconColor = danger && dangerColor ? dangerColor : T.textColor;
  const labelColor = danger && dangerColor ? dangerColor : T.textColor;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, { borderColor: T.border }]}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Ionicons
          name={icon}
          size={18}
          color={iconColor}
        />
        <Text
          style={[
            styles.rowLabel,
            { color: labelColor },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Header({
  title,
  onClose,
  T,
}: {
  title: string;
  onClose: () => void;
  T: any;
}) {
  return (
    <View style={styles.modalHeader}>
      <Text style={[styles.modalTitle, { color: T.textColor }]}>
        {title}
      </Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={22} color={T.textColor} />
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  fontSizeRow: {
    flexWrap: "wrap",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  wallpaperPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wallpaperPreviewCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  wallpaperPreviewImg: {
    width: "100%",
    height: "100%",
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  wallpaperColors: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheetContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },

  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 8,
  },

  blockedEmpty: {
    padding: 16,
    fontSize: 14,
  },
  blockedRow: {
    minHeight: 52,
    paddingVertical: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  modalBox: {
    width: "80%",
    borderRadius: 16,
    padding: 16,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 16,
  },
});