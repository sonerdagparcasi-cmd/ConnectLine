import type { ColorValue } from "react-native";
import { useColorScheme } from "react-native";

export type AppGradient = readonly [
  ColorValue,
  ColorValue,
  ...ColorValue[]
];

export function useAppGradient(): AppGradient {
  const isDark = useColorScheme() === "dark";

  return isDark
    ? (["#1834ae", "#000000"] as const) // 🌙 Dark
    : (["#00bfff", "#00c3ff"] as const); // ☀️ Light
}

