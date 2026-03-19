// src/domains/chat/components/message/MessageLocation.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { t } from "../../../../shared/i18n/t";

type Props = {
  label?: string;
  lat?: number;
  lng?: number;
  isMine: boolean;
  onPress?: () => void;
};

function MessageLocationInner({ label, lat, lng, isMine, onPress }: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? T.textColor : C.buttonText;
  const onAccentMuted = T.isDark ? T.mutedText : "rgba(255,255,255,0.85)";
  const color = isMine ? onAccentText : T.textColor;
  const subColor = isMine ? onAccentMuted : T.mutedText;
  const coords = lat != null && lng != null ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.wrap, { borderColor: isMine ? (T.isDark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.4)") : T.border }]}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={[styles.mapPlaceholder, { backgroundColor: T.cardBg }]}>
        <Ionicons name="map" size={32} color={T.mutedText} />
        <Text style={[styles.mapLabel, { color: T.mutedText }]}>
          {t("chat.attach.location")}
        </Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color }]} numberOfLines={1}>
          {label ?? t("chat.attach.location")}
        </Text>
        {coords ? (
          <Text style={[styles.coords, { color: subColor }]} numberOfLines={1}>
            {coords}
          </Text>
        ) : null}
      </View>
      {onPress && (
        <Ionicons name="navigate" size={20} color={color} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    minWidth: 220,
  },
  mapPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mapLabel: { fontSize: 9, fontWeight: "600", marginTop: 2 },
  textWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: "700" },
  coords: { fontSize: 11, marginTop: 2 },
});

export default memo(MessageLocationInner);
