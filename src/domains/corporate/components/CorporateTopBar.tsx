// src/domains/corporate/components/CorporateTopBar.tsx
// 🔒 GLOBAL CORPORATE TOP BAR
// ADIM 22 — Üst Menü: Akış | İş İlanları | Başvurular
// ADIM 23 — Messaging Entry
// FIX — Gradient Header (Dark/Light)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity, View } from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type CorporateTopTab = "feed" | "jobs" | "applications";

type Props = {
  title: string;

  showBack?: boolean;
  onBackPress?: () => void;

  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;

  showMessageButton?: boolean;
  onMessagePress?: () => void;

  showTopMenu?: boolean;
  activeTab?: CorporateTopTab;
  onTabChange?: (tab: CorporateTopTab) => void;

  applicationsBadge?: number;
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function CorporateTopBar({
  title,
  showBack = true,
  onBackPress,
  rightIcon,
  onRightPress,

  showMessageButton = false,
  onMessagePress,

  showTopMenu = false,
  activeTab = "feed",
  onTabChange,

  applicationsBadge,
}: Props) {
  const T = useAppTheme();
  const navigation = useNavigation<any>();

  const canGoBack = (() => {
    try {
      return typeof navigation?.canGoBack === "function"
        ? navigation.canGoBack()
        : true;
    } catch {
      return true;
    }
  })();

  const shouldShowBack = showBack && canGoBack;

  function handleBack() {
    if (onBackPress) return onBackPress();
    if (typeof navigation?.goBack === "function") navigation.goBack();
  }

  const iconColor = T.isDark ? "#fff" : "#000";

  const rightContent =
    showMessageButton || rightIcon ? (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {showMessageButton && (
          <TouchableOpacity
            onPress={onMessagePress}
            activeOpacity={0.85}
            style={{ padding: 8 }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={iconColor} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            disabled={!onRightPress}
            activeOpacity={0.85}
            style={{ padding: 8, opacity: onRightPress ? 1 : 0.6 }}
          >
            <Ionicons name={rightIcon} size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    ) : undefined;

  return (
    <>
      <AppGradientHeader
        title={title}
        onBack={shouldShowBack ? handleBack : undefined}
        right={rightContent}
      />

      {showTopMenu && onTabChange && (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 12,
            marginBottom: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: T.border,
            overflow: "hidden",
          }}
        >
          <TopTabButton
            T={T}
            label="Akış"
            active={activeTab === "feed"}
            onPress={() => onTabChange("feed")}
          />

          <TopTabButton
            T={T}
            label="İş İlanları"
            active={activeTab === "jobs"}
            onPress={() => onTabChange("jobs")}
          />

          <TopTabButton
            T={T}
            label="Başvurular"
            active={activeTab === "applications"}
            badge={applicationsBadge}
            onPress={() => onTabChange("applications")}
          />
        </View>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function TopTabButton({
  T,
  label,
  active,
  badge,
  onPress,
}: {
  T: any;
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: active ? T.cardBg : "transparent",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text
          style={{
            color: active ? T.textColor : T.mutedText,
            fontWeight: "900",
          }}
        >
          {label}
        </Text>

        {typeof badge === "number" && badge > 0 && (
          <View
            style={{
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: T.accent,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 5,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>
              {badge}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}