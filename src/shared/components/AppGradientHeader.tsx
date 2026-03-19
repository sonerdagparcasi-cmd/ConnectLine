// src/shared/components/AppGradientHeader.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/appTheme";

const LIGHT_GRADIENT: readonly [string, string] = ["#ffffff", "#00bfff"];
const DARK_GRADIENT: readonly [string, string] = ["#000000", "#1834ae"];
const HEADER_HEIGHT = 56;
const ICON_LIGHT = "#000";
const ICON_DARK = "#fff";

export type AppGradientHeaderProps = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function AppGradientHeader({
  title,
  onBack,
  right,
}: AppGradientHeaderProps) {
  const T = useAppTheme();
  const colors = T.isDark ? DARK_GRADIENT : LIGHT_GRADIENT;
  const iconColor = T.isDark ? ICON_DARK : ICON_LIGHT;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView edges={[]} style={styles.safe}>
        <View style={styles.row}>
          <View style={styles.left}>
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                activeOpacity={0.85}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={22} color={iconColor} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.center}>
            {title ? (
              <Text
                style={[styles.title, { color: iconColor }]}
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : null}
          </View>

          <View style={styles.right}>{right ?? null}</View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: "100%",
  },
  safe: {
    justifyContent: "center",
    marginTop: 0,
    paddingTop: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 56,
  },
  left: {
    width: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  right: {
    width: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});