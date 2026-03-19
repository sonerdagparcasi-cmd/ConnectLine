// src/shared/components/AppBackButton.tsx
// Ortak geri butonu: gradient arka plan, theme ile gündüz/gece

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { useAppTheme } from "../theme/appTheme";

const LIGHT_GRADIENT: readonly [string, string] = ["#ffffff", "#67d9ea"];
const DARK_GRADIENT: readonly [string, string] = ["#000000", "#1834ae"];

const SIZE = 38;
const BORDER_RADIUS = 19;

export type AppBackButtonProps = {
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
};

export default function AppBackButton({
  onPress,
  style,
  testID,
}: AppBackButtonProps) {
  const T = useAppTheme();
  const colors = T.isDark ? DARK_GRADIENT : LIGHT_GRADIENT;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.touch, style]}
      testID={testID}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={T.textColor}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    width: SIZE,
    height: SIZE,
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
