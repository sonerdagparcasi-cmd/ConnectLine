// src/domains/store/screens/StoreCampaignCreateEventScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { storeCampaignService } from "../services/storeCampaignService";

function toInt(v: string, fallback: number) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export default function StoreCampaignCreateEventScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();

  const [title, setTitle] = useState("%50 indirim günü");
  const [description, setDescription] = useState(
    "Etkinlik süresince seçili ürünlerde indirim uygulanır. Katılım/davetler mock’tur."
  );
  const [percent, setPercent] = useState("50");
  const [startsInDays, setStartsInDays] = useState("2");
  const [durationDays, setDurationDays] = useState("1");
  const [inviteOnly, setInviteOnly] = useState(false);

  const safePercent = useMemo(() => Math.max(0, Math.min(100, toInt(percent, 50))), [percent]);

  async function onCreate() {
    try {
      const c = await storeCampaignService.createEventCampaign({
        title: title.trim() || "%50 indirim günü",
        description: description.trim() || "Mock etkinlik",
        percent: safePercent,
        startsInDays: Math.max(0, toInt(startsInDays, 2)),
        durationDays: Math.max(1, toInt(durationDays, 1)),
        inviteOnly,
      });

      Alert.alert("Oluşturuldu", "Etkinlik oluşturuldu (mock).");
      nav.replace("StoreCampaignDetail", { campaignId: c.id });
    } catch {
      Alert.alert("Hata", "Etkinlik oluşturulamadı.");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title="Etkinlik Oluştur"
        onBack={() => nav.goBack()}
      />

      <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
        <Field label="Başlık" value={title} onChange={setTitle} />
        <Field label="Açıklama" value={description} onChange={setDescription} multiline />

        <View style={styles.row2}>
          <Field label="İndirim (%)" value={String(safePercent)} onChange={setPercent} keyboard="number-pad" />
          <Field label="Başlangıç (gün)" value={startsInDays} onChange={setStartsInDays} keyboard="number-pad" />
        </View>

        <View style={styles.row2}>
          <Field label="Süre (gün)" value={durationDays} onChange={setDurationDays} keyboard="number-pad" />
          <Toggle
            label="Sadece davetliler"
            value={inviteOnly}
            onToggle={() => setInviteOnly((p) => !p)}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onCreate}
          style={[styles.primaryBtn, { borderColor: T.border }]}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color={T.textColor} />
          <Text style={[styles.primaryText, { color: T.textColor }]}>Oluştur (Mock)</Text>
        </TouchableOpacity>

        <Text style={[styles.note, { color: T.mutedText }]}>
          Not: Bu ekran sadece UI/servis mock’tur. API entegrasyonu daha sonra yapılır.
        </Text>
      </View>
    </View>
  );

  function Field(props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    keyboard?: "default" | "number-pad";
  }) {
    return (
      <View style={styles.field}>
        <Text style={[styles.label, { color: T.mutedText }]}>{props.label}</Text>
        <View style={[styles.inputWrap, { borderColor: T.border }]}>
          <TextInput
            value={props.value}
            onChangeText={props.onChange}
            placeholder={props.label}
            placeholderTextColor={T.mutedText}
            keyboardType={props.keyboard ?? "default"}
            multiline={!!props.multiline}
            style={[
              styles.input,
              {
                color: T.textColor,
                minHeight: props.multiline ? 80 : undefined,
                textAlignVertical: props.multiline ? "top" : "center",
              },
            ]}
          />
        </View>
      </View>
    );
  }

  function Toggle(props: { label: string; value: boolean; onToggle: () => void }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={props.onToggle}
        style={[styles.toggle, { borderColor: T.border }]}
      >
        <Ionicons
          name={props.value ? "checkbox-outline" : "square-outline"}
          size={18}
          color={T.textColor}
        />
        <Text style={[styles.toggleText, { color: T.textColor }]} numberOfLines={1}>
          {props.label}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 14, paddingHorizontal: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 18, fontWeight: "900" },

  backBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: { fontSize: 12, fontWeight: "900" },

  card: { marginTop: 10, borderWidth: 1, borderRadius: 18, padding: 12, gap: 12 },

  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: "900" },
  inputWrap: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 10 },
  input: { fontSize: 13, fontWeight: "800" },

  row2: { flexDirection: "row", gap: 10, alignItems: "flex-start" },

  toggle: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleText: { flex: 1, fontSize: 12, fontWeight: "900" },

  primaryBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { fontSize: 13, fontWeight: "900" },

  note: { fontSize: 12, fontWeight: "700", lineHeight: 16 },
});
