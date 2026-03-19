// src/domains/corporate/onboarding/screens/CorporateOnboardingScreen.tsx
// 🔒 ONBOARDING ENTRY (STABLE)
//
// FIX (KİLİTLİ):
// - "Devam Et" yanlış route'a gidiyordu: "RoleSelect"
// - CorporateNavigator'da doğru route: "CorporateRoleSelect"

import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export default function CorporateOnboardingScreen({ navigation }: any) {
  const T = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        backgroundColor: T.backgroundColor,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12, color: T.textColor }}>
        Kurumsal Alana Hoş Geldin
      </Text>

      <Text style={{ marginBottom: 24, color: T.mutedText }}>
        Devam etmeden önce seni tanıyalım.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("CorporateRoleSelect")}
        activeOpacity={0.85}
      >
        <Text style={{ color: T.accent, fontWeight: "800" }}>
          Devam Et →
        </Text>
      </TouchableOpacity>
    </View>
  );
}