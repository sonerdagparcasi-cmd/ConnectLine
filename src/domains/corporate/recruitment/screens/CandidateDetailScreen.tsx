// src/domains/corporate/recruitment/screens/CandidateDetailScreen.tsx

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useRecruitment } from "../hooks/useRecruitment";

export default function CandidateDetailScreen({ route }: any) {
  const T = useAppTheme();
  const { id } = route.params as { id: string };

  const { ranked, setStatus } = useRecruitment("j1");
  const app = ranked.find((x) => x.id === id);

  if (!app) return null;

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        {app.candidateName}
      </Text>

      <Text style={{ color: T.mutedText }}>
        {app.jobTitle} • %{app.aiScore} • {app.status}
      </Text>

      <View style={[styles.box, { borderColor: T.border }]}>
        <Text style={{ color: T.textColor, fontWeight: "900" }}>
          Sıralama Gerekçesi
        </Text>
        {app.rankReason.map((r, i) => (
          <Text key={i} style={{ color: T.mutedText }}>
            • {r}
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <Action
          label="İnceleniyor"
          onPress={() => setStatus(app.id, "reviewing")}
          T={T}
        />
        <Action
          label="Kısa Liste"
          onPress={() => setStatus(app.id, "shortlist")}
          T={T}
          primary
        />
        <Action
          label="Reddet"
          onPress={() => setStatus(app.id, "rejected")}
          T={T}
          danger
        />
      </View>

      <Text style={{ color: T.mutedText, marginTop: 14 }}>
        CV / Portfolyo / Video CV bağlantıları (backend gelince buraya bağlanacak)
      </Text>
    </View>
  );
}

function Action({
  label,
  onPress,
  T,
  primary,
  danger,
}: {
  label: string;
  onPress: () => void;
  T: any;
  primary?: boolean;
  danger?: boolean;
}) {
  const bg = primary ? T.accent : "transparent";
  const color = primary ? "#fff" : danger ? "red" : T.textColor;
  const borderColor = danger ? "red" : T.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderColor,
        },
      ]}
      activeOpacity={0.85}
    >
      <Text style={{ color, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 6 },
  box: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    gap: 6,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  btn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});