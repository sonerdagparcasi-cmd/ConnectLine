// src/domains/chat/components/message/MessageFile.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { t } from "../../../../shared/i18n/t";

type Props = {
  fileName?: string;
  isMine: boolean;
  onPress?: () => void;
};

function MessageFileInner({ fileName, isMine, onPress }: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? T.textColor : C.buttonText;
  const onAccentMuted = T.isDark ? T.mutedText : "rgba(255,255,255,0.85)";
  const color = isMine ? onAccentText : T.textColor;
  const subColor = isMine ? onAccentMuted : T.mutedText;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.wrap, { borderColor: isMine ? (T.isDark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.4)") : T.border }]}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Ionicons name="document" size={24} color={color} />
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: subColor }]} numberOfLines={1}>
          {t("chat.message.file")}
        </Text>
        <Text style={[styles.name, { color }]} numberOfLines={1}>
          {fileName ?? "file"}
        </Text>
      </View>
      {onPress && (
        <Ionicons name="download-outline" size={18} color={color} />
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
    minWidth: 200,
  },
  textWrap: { flex: 1, minWidth: 0 },
  label: { fontSize: 11, fontWeight: "600" },
  name: { fontSize: 13, fontWeight: "700" },
});

export default memo(MessageFileInner);
