// src/shared/components/ScreenHeaderGradient.tsx
// Geri ekran header'ı için gradient arka plan (light/dark)

import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { useAppTheme } from "../theme/appTheme";

const LIGHT_COLORS: readonly [string, string] = ["#ffffff", "#67d9ea"];
const DARK_COLORS: readonly [string, string] = ["#000000", "#1834ae"];

export type ScreenHeaderGradientProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Geri butonu olan ekranların header container'ı için gradient wrapper.
 * useAppTheme ile light/dark gradient uygular; layout ve yükseklik style ile korunur.
 */
export default function ScreenHeaderGradient({
  children,
  style,
}: ScreenHeaderGradientProps) {
  const T = useAppTheme();
  const colors = T.isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
