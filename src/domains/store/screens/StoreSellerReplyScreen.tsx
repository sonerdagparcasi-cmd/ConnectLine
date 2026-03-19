import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreStackParamList } from "../navigation/StoreNavigator";
import { storeReviewService } from "../services/storeReviewService";

type R = RouteProp<StoreStackParamList, "StoreSellerReply">;

export default function StoreSellerReplyScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<R>();

  const [text, setText] = useState("");

  const canSubmit = useMemo(() => text.trim().length >= 6, [text]);

  async function submit() {
    if (!canSubmit) return;
    await storeReviewService.addSellerReply(params.reviewId, text);
    nav.goBack();
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>Satıcı Yanıtı</Text>

      <Text style={[styles.label, { color: T.mutedText }]}>
        Yanıtın kısa, net ve saygılı olmalı.
      </Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Yanıt yaz…"
        placeholderTextColor={T.mutedText}
        multiline
        style={[styles.textarea, { color: T.textColor, borderColor: T.border }]}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={submit}
        disabled={!canSubmit}
        style={[
          styles.cta,
          { backgroundColor: canSubmit ? T.accent : T.border, opacity: canSubmit ? 1 : 0.6 },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "900" }}>Yanıtla</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 18, fontWeight: "900" },
  label: { fontSize: 12, fontWeight: "900" },
  textarea: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 140,
    fontWeight: "800",
  },
  cta: { marginTop: 8, padding: 14, borderRadius: 14, alignItems: "center" },
});
