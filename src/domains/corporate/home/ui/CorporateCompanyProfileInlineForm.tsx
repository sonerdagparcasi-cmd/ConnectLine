// src/domains/corporate/home/ui/CorporateIndividualProfileInlineForm.tsx
// 🔒 FAZ 2.3 — Individual Corporate Profile Inline Form (STABLE)
//
// FIX (FINAL):
// - Çift avatar problemi çözüldü (avatar UI tamamen kaldırıldı)
// - Avatar sadece Screen seviyesinde yönetilir (IdentityCreate / CorporateHome)
// - Form sadece veri alanlarını içerir
// - UI-only (picker/storage/backend yok)

import React, { memo } from "react";
import { Text, TextInput, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type IndividualFormMode = "identity" | "full";

export type IndividualDraft = {
  avatarUri: string | null;

  fullName: string;
  headline: string;
  portfolioUrl: string;

  country: string;
  city: string;
  school: string;
  currentCompany: string;
  currentRole: string;

  about: string;
  experience: string;

  focusAreas: string[];
  highlights: string[];
};

type Props = {
  mode: IndividualFormMode;
  editing: boolean;

  value: IndividualDraft;
  onChange: (next: IndividualDraft) => void;
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function normalizeArray(v?: string[]) {
  if (!Array.isArray(v)) return [];
  return v;
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

function CorporateIndividualProfileInlineForm({
  mode,
  editing,
  value,
  onChange,
}: Props) {
  const T = useAppTheme();
  const isFull = mode === "full";

  const safeFocusAreas = normalizeArray(value.focusAreas);
  const safeHighlights = normalizeArray(value.highlights);

  function patch<K extends keyof IndividualDraft>(key: K, next: IndividualDraft[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 24 }}>
      {/* ================= SECTION 1 — IDENTITY ================= */}
      <Section
        title="👤 Kimlik & Ünvan"
        subtitle="Kurumsal vitrinde nasıl görüneceksin?"
        T={T}
      >
        <TextInput
          value={value.fullName}
          editable={editing}
          onChangeText={(v) => patch("fullName", v)}
          placeholder="Ad Soyad"
          placeholderTextColor={T.mutedText}
          style={inputStyle(T)}
        />

        <TextInput
          value={value.headline}
          editable={editing}
          onChangeText={(v) => patch("headline", v)}
          placeholder="Kısa ünvan"
          placeholderTextColor={T.mutedText}
          style={inputStyle(T)}
        />

        <TextInput
          value={value.portfolioUrl}
          editable={editing}
          onChangeText={(v) => patch("portfolioUrl", v)}
          placeholder="Web sitesi / Portfolyo"
          placeholderTextColor={T.mutedText}
          style={inputStyle(T)}
        />
      </Section>

      {/* ================= FULL MODE ================= */}
      {isFull && (
        <>
          <Section
            title="📍 Konum & Eğitim"
            subtitle="Nerede yaşıyor ve eğitim durumun"
            T={T}
          >
            <TextInput
              value={value.city}
              editable={editing}
              onChangeText={(v) => patch("city", v)}
              placeholder="Şehir"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T)}
            />

            <TextInput
              value={value.country}
              editable={editing}
              onChangeText={(v) => patch("country", v)}
              placeholder="Ülke"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T)}
            />

            <TextInput
              value={value.school}
              editable={editing}
              onChangeText={(v) => patch("school", v)}
              placeholder="Üniversite / Eğitim"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T)}
            />
          </Section>

          <Section
            title="💼 Çalışma Bilgileri"
            subtitle="Şu anki rol ve şirket"
            T={T}
          >
            <TextInput
              value={value.currentCompany}
              editable={editing}
              onChangeText={(v) => patch("currentCompany", v)}
              placeholder="Çalıştığın şirket"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T)}
            />

            <TextInput
              value={value.currentRole}
              editable={editing}
              onChangeText={(v) => patch("currentRole", v)}
              placeholder="Rolün"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T)}
            />
          </Section>

          <Section
            title="📝 Kişisel & Profesyonel Açıklama"
            subtitle="Kısaca kendini anlat"
            T={T}
          >
            <TextInput
              value={value.about}
              editable={editing}
              multiline
              onChangeText={(v) => patch("about", v)}
              placeholder="Kısa kişisel/profesyonel özet"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T, true)}
            />

            <TextInput
              value={value.experience}
              editable={editing}
              multiline
              onChangeText={(v) => patch("experience", v)}
              placeholder="Deneyimlerin"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T, true)}
            />
          </Section>

          <Section
            title="🎯 Uzmanlık & Öne Çıkanlar"
            subtitle="Virgül ile ayır"
            T={T}
          >
            <TextInput
              value={safeFocusAreas.join(", ")}
              editable={editing}
              onChangeText={(v) =>
                patch(
                  "focusAreas",
                  v.split(",").map((x) => x.trim()).filter(Boolean)
                )
              }
              placeholder="Örn: Mobil, Fintech, UI/UX"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T)}
            />

            <TextInput
              value={safeHighlights.join(", ")}
              editable={editing}
              onChangeText={(v) =>
                patch(
                  "highlights",
                  v.split(",").map((x) => x.trim()).filter(Boolean)
                )
              }
              placeholder="Öne çıkan yönlerin"
              placeholderTextColor={T.mutedText}
              style={inputStyle(T)}
            />
          </Section>
        </>
      )}
    </View>
  );
}

export default memo(CorporateIndividualProfileInlineForm);

/* ------------------------------------------------------------------ */
/* UI PARTS                                                           */
/* ------------------------------------------------------------------ */

function Section({
  title,
  subtitle,
  children,
  T,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View
      style={{
        backgroundColor: T.cardBg,
        borderColor: T.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        gap: 12,
      }}
    >
      <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 15 }}>
        {title}
      </Text>

      <Text style={{ color: T.mutedText, fontWeight: "700" }}>
        {subtitle}
      </Text>

      <View style={{ marginTop: 6, gap: 10 }}>{children}</View>
    </View>
  );
}

function inputStyle(T: ReturnType<typeof useAppTheme>, multiline = false) {
  return {
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.cardBg,
    color: T.textColor,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
    minHeight: multiline ? 80 : 44,
    textAlignVertical: multiline ? "top" : "center",
  } as const;
}