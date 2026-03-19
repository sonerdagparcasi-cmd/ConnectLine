// src/domains/corporate/home/ui/CorporateHomeOwnerEditor.tsx
// 🔒 FAZ 3.3 / ADIM 2 — Owner Management Entry (STABLE FIX)

import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCompany } from "../../hooks/useCompany";

type Props = {
  mode: "individual" | "company";
  completion?: {
    percent: number;
  } | null;
};

export default function CorporateHomeOwnerEditor({ mode, completion }: Props) {
  const T = useAppTheme();

  const { company, profileView } = useCompany("c1");

  /* ================= GUARD ================= */

  if (!company || !profileView) {
    return null;
  }

  /* ================= COMPLETION ================= */

  const percent = completion?.percent ?? null;

  const completionText =
    typeof percent === "number"
      ? percent >= 80
        ? "Profilin paylaşım için oldukça iyi bir seviyede."
        : percent >= 50
        ? "Profilini birkaç küçük dokunuşla daha güçlü hale getirebilirsin."
        : "Profilini adım adım güçlendirebilirsin."
      : null;

  return (
    <View
      style={{
        marginTop: 32,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.cardBg,
        gap: 14,
      }}
    >
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name="shield-checkmark" size={20} color={T.textColor} />
        <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 15 }}>
          Yönetim & Paylaşım
        </Text>
      </View>

      <Text style={{ color: T.mutedText, lineHeight: 18 }}>
        Profilini {mode === "company" ? "şirket" : "bireysel"} olarak
        oluşturdun. Aşağıdaki araçlarla paylaşım ve yönetim adımlarına
        geçebilirsin.
      </Text>

      {/* COMPLETION */}
      {completionText ? (
        <View
          style={{
            marginTop: 6,
            padding: 12,
            borderRadius: 14,
            backgroundColor: "rgba(127,127,127,0.08)",
          }}
        >
          <Text style={{ color: T.mutedText, fontSize: 12 }}>
            {completionText}
          </Text>
        </View>
      ) : null}

      {/* ACTIONS */}
      <View style={{ gap: 10 }}>
        <OwnerAction
          icon="qr-code"
          title="QR ile Paylaş"
          subtitle="Profilini yüz yüze ortamlarda hızlıca paylaş"
          T={T}
        />

        <OwnerAction
          icon="share-social"
          title="Bağlantı ile Paylaş"
          subtitle="Profil linkini kopyala ve paylaş"
          T={T}
        />

        <OwnerAction
          icon="settings"
          title="Gelişmiş Yönetim"
          subtitle="İlanlar, vitrin ve yetkiler (yakında)"
          disabled
          T={T}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* UI PART                                                            */
/* ------------------------------------------------------------------ */

function OwnerAction({
  icon,
  title,
  subtitle,
  disabled,
  T,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  disabled?: boolean;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.85}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: disabled
          ? "rgba(127,127,127,0.06)"
          : "transparent",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Ionicons name={icon} size={20} color={T.textColor} />

      <View style={{ flex: 1 }}>
        <Text style={{ color: T.textColor, fontWeight: "900" }}>
          {title}
        </Text>

        <Text style={{ color: T.mutedText, fontSize: 12, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}