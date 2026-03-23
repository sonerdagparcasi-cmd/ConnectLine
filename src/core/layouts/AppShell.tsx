// src/core/layouts/AppShell.tsx
// 🔒 CORE APP SHELL – STABİL
// Kurallar:
// - AppShell GLOBAL kabuktur
// - Domain içi sekme / state TUTMAZ
// - İş İlanları / Başvurular burada YOK
// - Sadece üst domain menüsü + alt bar

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { ChatNotificationBadge } from "../../domains/chat/components/ChatNotificationBadge";
import { chatService } from "../../domains/chat/services/chatService";
import { subscribeUnreadCount } from "../../domains/social/services/socialNotificationService";
import { clearSession } from "../../shared/auth/authSession";
import { AppThemeProvider } from "../../shared/theme/appTheme";
import { getColors } from "../../shared/theme/colors";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type BottomTabKey =
  | "home"
  | "chat"
  | "video"
  | "corporate"
  | "store"
  | "social";

type Props = {
  children: ReactNode;
  activeTop: string;
  activeBottom: BottomTabKey;
  onSelectTab?: (key: BottomTabKey) => void;
  onLogout: () => void;
  onTopTabChange?: (tabLabel: string) => void;
  /** Badge count for chat tab (e.g. unread messages) */
  chatBadge?: number;
};

const BOTTOM_BAR_HEIGHT = 56;

/* ------------------------------------------------------------------ */
/* APP SHELL (CORE – KİLİTLİ)                                          */
/* ------------------------------------------------------------------ */

export default function AppShell({
  children,
  activeTop,
  activeBottom,
  onSelectTab,
  onLogout,
  onTopTabChange,
  chatBadge = 0,
}: Props) {
  const systemDark = true;
  const [manualDark, setManualDark] = useState<boolean | null>(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const isDark = manualDark ?? systemDark;
  const C = useMemo(() => getColors(isDark), [isDark]);

  const backgroundColor = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#2b2a2a";

  const topGradientColors = isDark
    ? (["#000000", "#1834ae"] as const)
    : (["#eef8f9", "#00bfff"] as const);

  const pillBg = isDark ? "rgba(0,0,0,0.35)" : "rgba(153,235,247,0.85)";
  const pillBorder = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.12)";
  const iconPillBg = isDark ? "rgba(0,0,0,0.4)" : "rgba(149,232,243,0.9)";
  const themeIcon = isDark ? "moon" : "sunny";

  const topTabs = [
  "Mesajlar",
  "Kurumsal",
  "Alışveriş",
  "Sosyal",
  "İş İlanları",
  "Başvurular",
] as const;

  /* ------------------------------------------------------------------ */
  /* REALTIME                                                          */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    chatService.connectRealtime();
    return () => chatService.disconnectRealtime();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeUnreadCount(setUnreadCount);
    return unsubscribe;
  }, []);

  function handleLogout() {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: () => {
          chatService.disconnectRealtime();
          clearSession();
          onLogout();
        },
      },
    ]);
  }

  const themeValue = useMemo(
    () => ({
      isDark,
      backgroundColor,
      textColor,
      accent: C.accent,
      mutedText: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.55)",
      cardBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      border: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
      background: backgroundColor,
      card: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      inputBackground: isDark ? "#111111" : "#ececec",
      primary: C.accent,
      lightGradient: { colors: ["#ffffff", "#00bfff"] as const },
      darkGradient: { colors: ["#000000", "#1834ae"] as const },
    }),
    [C.accent, backgroundColor, isDark, textColor]
  );

  function handleBottomPress(key: BottomTabKey) {
    onSelectTab?.(key);
  }

  return (
    <AppThemeProvider value={themeValue}>
      <View style={[styles.root, { backgroundColor }]}>
        {/* ================= TOP BAR ================= */}
        <LinearGradient
          colors={topGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topBar}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topTabs}
          >
            {topTabs.map((tab) => {
              const active = activeTop === tab;
              const isChatTab = tab === "Mesajlar";
              const isSocialTab = tab === "Sosyal";
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.85}
                  onPress={() => onTopTabChange?.(tab)}
                  style={[
                    styles.topPill,
                    { backgroundColor: pillBg, borderColor: pillBorder },
                    active &&
                      (isDark
                        ? styles.topPillActiveDark
                        : styles.topPillActiveLight),
                  ]}
                >
                  <View style={styles.topTabLabelWrap}>
                    <Text
                      style={[
                        styles.topPillText,
                        active && styles.topPillTextActive,
                        { color: textColor },
                      ]}
                    >
                      {tab}
                    </Text>
                    {isSocialTab && unreadCount > 0 ? (
                      <View style={styles.socialBadge}>
                        <Text style={styles.socialBadgeText}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {isChatTab && chatBadge > 0 && (
                    <ChatNotificationBadge count={chatBadge} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() =>
                setManualDark((v) => (v === null ? !systemDark : !v))
              }
              style={[
                styles.iconPill,
                { backgroundColor: iconPillBg, borderColor: pillBorder },
              ]}
            >
              <Ionicons name={themeIcon} size={18} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={[
                styles.iconPill,
                { backgroundColor: iconPillBg, borderColor: pillBorder },
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color={textColor} />
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>

        {/* ================= CONTENT ================= */}
        <SafeAreaView
          style={[
            styles.content,
            { backgroundColor, paddingBottom: BOTTOM_BAR_HEIGHT },
          ]}
        >
          {children}
        </SafeAreaView>

        {/* ================= BOTTOM BAR ================= */}
        <LinearGradient
          colors={[C.accent, backgroundColor]}
          style={styles.bottomBar}
        >
          {[
            ["home", require("../../assets/icons/home.png")],
            ["chat", require("../../assets/icons/chat.png")],
            ["video", require("../../assets/icons/reels.png")],
            ["corporate", require("../../assets/icons/company.png")],
            ["store", require("../../assets/icons/shop.png")],
            ["social", require("../../assets/icons/network.png")],
          ].map(([key, icon]) => {
            const active = activeBottom === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleBottomPress(key as BottomTabKey)}
                style={styles.bottomItem}
                activeOpacity={0.85}
              >
                <View>
                  <Image
                    source={icon}
                    resizeMode="contain"
                    style={[
                      styles.icon,
                      {
                        tintColor: textColor,
                        opacity: active ? 1 : 0.55,
                      },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.dot,
                    {
                      opacity: active ? 1 : 0,
                      backgroundColor: textColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
    </AppThemeProvider>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingTop: 12, paddingBottom: 4 },
  topTabs: {
    paddingHorizontal: 12,
    paddingTop: 42,
    gap: 6,
    alignItems: "center",
    flexDirection: "row",
  },
  topPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  topPillActiveDark: {
    borderColor: "#1f41ff",
  },
  topPillActiveLight: {
    borderColor: "#014464",
    backgroundColor: "#4dbef3",
  },
  topPillText: { fontSize: 12, fontWeight: "600" },
  topPillTextActive: { fontWeight: "800" },
  topTabLabelWrap: {
    position: "relative",
  },
  socialBadge: {
    position: "absolute",
    top: -9,
    right: -18,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "400",
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 22,
    height: 56,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomItem: { alignItems: "center", gap: 6 },
  icon: { width: 26, height: 26 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});