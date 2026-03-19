// src/domains/corporate/onboarding/screens/CorporateRoleSelectScreen.tsx
// 🔒 ONBOARDING ROLE SELECT (STABLE)
//
// FIX (KİLİTLİ):
// - Seçim sonrası ekranda kalıyordu (navigasyon yoktu)
// - Seçimi kayıt altına al:
//   1) onboarding state (mevcut davranış korunur)
//   2) corporateRoleService (CorporateWhoAreYou ile tutarlı TEK rol kaynağına yaklaşım)
// - Seçimden sonra IdentityCreate'e git (UI-only)

import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { corporateRoleService } from "../../identity/services/corporateRoleService";
import { useCorporateOnboarding } from "../hooks/useCorporateOnboarding";

export default function CorporateRoleSelectScreen({ navigation }: any) {
  const T = useAppTheme();
  const { complete } = useCorporateOnboarding();

  async function choose(role: "company" | "individual") {
    // 1) onboarding state (mevcut yapı bozulmasın)
    await complete(role);

    // 2) corporate role (akış tutarlılığı)
    try {
      await corporateRoleService.set(role);
    } catch {
      // sessiz
    }

    // 3) Identity create akışına geç
    navigation.replace("CorporateIdentityCreate");
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: T.backgroundColor }}>
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 16, color: T.textColor }}>
        Sen kimsin?
      </Text>

      <TouchableOpacity onPress={() => choose("company")} activeOpacity={0.85}>
        <Text style={{ marginBottom: 12, color: T.textColor, fontWeight: "700" }}>
          🏢 Şirket / İşveren
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => choose("individual")} activeOpacity={0.85}>
        <Text style={{ color: T.textColor, fontWeight: "700" }}>
          👤 Bireysel Kurumsal Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
}