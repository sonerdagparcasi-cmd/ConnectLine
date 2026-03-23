// src/domains/corporate/components/CorporatePostOverlays.tsx
// 🔒 Kurumsal overlay render — feed / detay / fullscreen ortak

import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { CorporateOverlay } from "../types/feed.types";

type Props = {
  overlays?: CorporateOverlay[];
  /** Medya kutusu genişliği (onLayout) */
  width: number;
  height: number;
};

export default function CorporatePostOverlays({ overlays, width, height }: Props) {
  const T = useAppTheme();

  if (!overlays?.length || width < 8 || height < 8) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {overlays.map((o) => {
        const left = o.x * width;
        const top = o.y * height;
        const fs = o.style?.fontSize ?? (o.type === "text" ? 15 : 13);
        const fw = o.style?.fontWeight === "700" ? "700" : "600";
        const color = o.style?.color ?? "#fff";

        if (o.type === "tag") {
          return (
            <View
              key={o.id}
              pointerEvents="auto"
              style={[
                styles.tagPill,
                {
                  left,
                  top,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  borderColor: "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Text
                style={{
                  color: T.textColor === "#fff" ? "#e8eaed" : "#f5f5f5",
                  fontSize: fs,
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {o.value}
              </Text>
            </View>
          );
        }

        return (
          <Text
            key={o.id}
            pointerEvents="none"
            numberOfLines={3}
            style={[
              styles.textOverlay,
              {
                left,
                top,
                color,
                fontSize: fs,
                fontWeight: fw as "400" | "500" | "600" | "700",
                maxWidth: width * 0.88,
                textShadowColor: "rgba(0,0,0,0.75)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              },
            ]}
          >
            {o.value}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  textOverlay: {
    position: "absolute",
  },
  tagPill: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ translateX: -8 }, { translateY: -10 }],
  },
});
