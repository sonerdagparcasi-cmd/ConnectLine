// src/domains/corporate/identity/screens/CorporateWhoAreYouScreen.tsx
// 🔒 ADIM 1 — WHO ARE YOU (ROLE SELECTION)
//
// KURALLAR (KİLİTLİ):
// - Sadece rol seçimi yapılır
// - Seçim TEK KAYNAK: corporateRoleService
// - Navigation SADECE bu ekranda
// - Seçimden sonra akış IdentityCreate’e gider
// - UI-only, backend varsayımı YOK
// - Alt menü Kurumsal entry = BU EKRAN

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import { corporateRoleService } from "../services/corporateRoleService";

type Nav = NativeStackNavigationProp<CorporateStackParamList>;

export default function CorporateWhoAreYouScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  async function selectRole(role: "company" | "individual") {
    // 🔒 1️⃣ Rolü kalıcı olarak kaydet
    await corporateRoleService.set(role);

    // 🔒 2️⃣ Doğrudan kısa form akışına geç
    navigation.replace("CorporateIdentityCreate");
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Kurumsal Alanda Kim Olarak Yer Almak İstersin?
      </Text>

      <Text style={[styles.subtitle, { color: T.mutedText }]}>
        Seçimini yap, birkaç temel bilgiyle hemen devam et.
      </Text>

      {/* ================= COMPANY ================= */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => selectRole("company")}
        style={[
          styles.card,
          {
            borderColor: T.border,
            backgroundColor: T.cardBg,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: T.textColor }]}>
          🏢 Şirket
        </Text>
        <Text style={[styles.cardDesc, { color: T.mutedText }]}>
          Şirket profili oluştur, ilan ver, başvuruları yönet.
        </Text>
      </TouchableOpacity>

      {/* ================= INDIVIDUAL ================= */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => selectRole("individual")}
        style={[
          styles.card,
          {
            borderColor: T.border,
            backgroundColor: T.cardBg,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: T.textColor }]}>
          👤 Bireysel Kurumsal
        </Text>
        <Text style={[styles.cardDesc, { color: T.mutedText }]}>
          Kurumsal kimlik oluştur, başvuru yap, network kur.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* =================================================================== */
/* STYLES                                                              */
/* =================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});