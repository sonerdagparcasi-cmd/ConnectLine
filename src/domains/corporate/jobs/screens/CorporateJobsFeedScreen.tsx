// 🔒 Global Jobs Feed
// Tüm şirketlerin açtığı ilanlar – herkes görür (UI-only)

import { useNavigation } from "@react-navigation/native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporateTopBar from "../../components/CorporateTopBar";
import { useCorporateJobs } from "../hooks/useCorporateJobs";

export default function CorporateJobsFeedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const { jobs } = useCorporateJobs(); // zaten mevcut hook

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title="İş İlanları" />

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CorporateJobDetail", { jobId: item.id })
            }
            style={{
              padding: 14,
              borderRadius: 14,
              backgroundColor: T.cardBg,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            <Text style={{ color: T.textColor, fontWeight: "900" }}>
              {item.title}
            </Text>
            <Text style={{ color: T.mutedText, marginTop: 4 }}>
              {item.companyName} · {item.location}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}