// src/domains/corporate/home/ui/CorporateIdentityChoice.tsx
// 🔒 ADIM 14.1 — Identity Choice (UI-only + Identity Bridge)
//
// Rol:
// - Kullanıcıdan kurumsal kimlik türünü alır
// - Seçimi CorporateIdentity storage’a yazar
// - Parent state’i bilgilendirir
//
// Kurallar:
// - Yeni route YOK
// - Yeni state YOK (local state tutulmaz)
// - useCorporateIdentity = TEK kimlik kaynağı
// - UI-only, side-effect sadece identity type set

import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCorporateIdentity } from "../../identity/hook/useCorporateIdentity";

export type IdentityMode = "individual" | "company";

type Props = {
  onSelect: (mode: IdentityMode) => void;
  /** Parent hangi modda olduğunu biliyorsa gönderir (UI netliği için) */
  currentMode?: IdentityMode | null;
};

export function CorporateIdentityChoice({ onSelect, currentMode }: Props) {
  const T = useAppTheme();
  const { selectType } = useCorporateIdentity();

  async function handleSelect(mode: IdentityMode) {
    // 🔒 Identity FIRST (global truth)
    await selectType(mode);

    // 🔒 Parent UI state
    onSelect(mode);
  }

  const isSelected = (m: IdentityMode) => currentMode === m;

  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 18 }}>
        Kurumsal Profil Türü
      </Text>
      <Text style={{ color: T.mutedText, fontWeight: "600" }}>
        Şu an hangi profili düzenlediğin net olsun.
      </Text>

      {/* ================= INDIVIDUAL ================= */}
      <TouchableOpacity
        onPress={() => handleSelect("individual")}
        activeOpacity={0.9}
        style={{
          padding: 16,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: isSelected("individual") ? T.accent : T.border,
          backgroundColor: isSelected("individual") ? T.accent + "22" : T.cardBg,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected("individual") ? T.accent : T.backgroundColor,
          }}
        >
          <Ionicons
            name="person"
            size={18}
            color={isSelected("individual") ? "#fff" : T.textColor}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: T.textColor, fontWeight: "800" }}>
            Bireysel Kurumsal Profil
          </Text>
          <Text style={{ color: T.mutedText, fontSize: 12 }}>
            👔 Kişisel vitrin • Network • Başvurular
          </Text>
        </View>

        {isSelected("individual") && (
          <Ionicons name="checkmark-circle" size={20} color={T.accent} />
        )}
      </TouchableOpacity>

      {/* ================= COMPANY ================= */}
      <TouchableOpacity
        onPress={() => handleSelect("company")}
        activeOpacity={0.9}
        style={{
          padding: 16,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: isSelected("company") ? T.accent : T.border,
          backgroundColor: isSelected("company") ? T.accent + "22" : T.cardBg,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected("company") ? T.accent : T.backgroundColor,
          }}
        >
          <Ionicons
            name="business"
            size={18}
            color={isSelected("company") ? "#fff" : T.textColor}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: T.textColor, fontWeight: "800" }}>
            Şirket Profili
          </Text>
          <Text style={{ color: T.mutedText, fontSize: 12 }}>
            🏢 Kurumsal vitrin • İlanlar • Yönetim
          </Text>
        </View>

        {isSelected("company") && (
          <Ionicons name="checkmark-circle" size={20} color={T.accent} />
        )}
      </TouchableOpacity>
    </View>
  );
}
