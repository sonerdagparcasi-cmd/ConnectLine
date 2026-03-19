// src/domains/corporate/recruitment/screens/ApplyJobScreen.tsx
// 🔒 APPLY JOB SCREEN — DISABLED (LOCKED)
//
// KURALLAR (KİLİTLİ):
// - Bu ekran BAŞVURU ALMAZ
// - Kurumsal başvurular SADECE ilan üzerinden yapılır
// - Paralel başvuru dünyası OLUŞMAZ
// - UI-only, sessiz, yönlendirici
//
// NEDEN VAR?
// - Eski akışlardan gelen navigation’lar için güvenli durak
// - Yanlış kullanımda veri KAYBI / ÇAKIŞMA olmasın diye

import { useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity, View } from "react-native";

export default function ApplyJobScreen() {
  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 14,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        Başvuru Bu Ekrandan Yapılmıyor
      </Text>

      <Text
        style={{
          textAlign: "center",
          opacity: 0.7,
          lineHeight: 20,
        }}
      >
        Kurumsal başvurular artık yalnızca iş ilanları üzerinden
        yapılmaktadır.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          marginTop: 12,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: "#000",
        }}
        activeOpacity={0.88}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "900",
          }}
        >
          Geri Dön
        </Text>
      </TouchableOpacity>
    </View>
  );
}