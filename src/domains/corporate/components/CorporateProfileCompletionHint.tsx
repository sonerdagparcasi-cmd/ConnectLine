// src/domains/corporate/components/CorporateProfileCompletionHint.tsx
// 🔒 FAZ 3.2 — Profile Completion Hint (UI-only, Owner-only)
//
// AMAÇ:
// - Sahip kullanıcıya sakin ve davetkâr rehberlik
// - “Eksik” dili yok, “istersen güçlendirebilirsin” dili var
//
// KURALLAR (DEĞİŞMEDİ):
// - Sadece owner görür
// - Sessiz component (kapatılabilir)
// - Zorlayıcı CTA yok
// - Davranış / state / akış değişmez

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  isOwner: boolean;
  missing?: {
    website?: boolean;
    description?: boolean;
    location?: boolean;
  };
  onAction?: () => void;
};

export default function CorporateProfileCompletionHint({
  isOwner,
  missing,
  onAction,
}: Props) {
  const T = useAppTheme();
  const [dismissed, setDismissed] = useState(false);

  if (!isOwner || dismissed) return null;

  const items: string[] = [];
  if (missing?.description) items.push("açıklama");
  if (missing?.website) items.push("web sitesi");
  if (missing?.location) items.push("konum");

  if (items.length === 0) return null;

  // 🔒 Yumuşak, davetkâr dil
  const hintText =
    items.length === 1
      ? `İstersen profilini ${items[0]} ekleyerek biraz daha güçlendirebilirsin.`
      : `İstersen profilini ${items.join(", ")} ekleyerek daha da güçlendirebilirsin.`;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <View style={styles.left}>
        <Ionicons name="sparkles-outline" size={16} color={T.accent} />
        <Text style={[styles.text, { color: T.textColor }]}>{hintText}</Text>
      </View>

      <View style={styles.actions}>
        {onAction && (
          <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
            <Text style={[styles.actionText, { color: T.accent }]}>
              Göz At
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setDismissed(true)}
          style={styles.closeBtn}
          accessibilityLabel="İpucunu kapat"
        >
          <Ionicons name="close" size={14} color={T.mutedText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "900",
  },
  closeBtn: {
    padding: 4,
  },
});