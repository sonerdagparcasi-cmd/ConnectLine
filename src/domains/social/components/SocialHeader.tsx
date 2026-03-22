// src/domains/social/components/SocialHeader.tsx
// 🔒 SOCIAL GLOBAL HEADER – AppGradientHeader wrapper

import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialNotificationBell from "./SocialNotificationBell";

const ICON_LIGHT = "#000";
const ICON_DARK = "#fff";

type Props = {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
  /** Bildirim zili + rozet */
  showNotificationBell?: boolean;
};

export default function SocialHeader({
  title,
  showBack = true,
  right,
  showNotificationBell = false,
}: Props) {
  const navigation = useNavigation();
  const T = useAppTheme();
  const iconColor = T.isDark ? ICON_DARK : ICON_LIGHT;

  function goBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  const rightSlot =
    showNotificationBell || right ? (
      <View style={styles.headerRight}>
        {showNotificationBell ? (
          <SocialNotificationBell iconColor={iconColor} />
        ) : null}
        {right}
      </View>
    ) : undefined;

  return (
    <AppGradientHeader
      title={title}
      onBack={showBack ? goBack : undefined}
      right={rightSlot}
    />
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
