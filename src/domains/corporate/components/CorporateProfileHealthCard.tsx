import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { Company } from "../types/company.types";

/**
 * 🔒 CorporateProfileHealthCard (ADIM 6 – KİLİTLİ)
 *
 * - UI ONLY
 * - Backend yok
 * - Global state yok
 * - Sahip kullanıcıya “profil durumu” hissi verir
 */

type Props = {
  company: Company;
  hasAvatar: boolean;
};

export default function CorporateProfileHealthCard({
  company,
  hasAvatar,
}: Props) {
  const T = useAppTheme();

  /* -------------------------------------------------------------- */
  /* LOCAL SCORE (UI HİSSİ)                                         */
  /* -------------------------------------------------------------- */

  let score = 0;
  const hints: string[] = [];

  if (company.description) score += 20;
  else hints.push("Şirket açıklaması ekleyebilirsin");

  if (hasAvatar) score += 20;
  else hints.push("Profil fotoğrafı eklemek profili güçlendirir");

  if (company.followers > 0) score += 20;
  else hints.push("Takipçi kazanmak görünürlüğü artırır");

  if (company.sector) score += 20;
  if (company.location) score += 20;

  const level =
    score >= 80
      ? "Profilin çok iyi durumda"
      : score >= 50
      ? "Profilin gelişiyor"
      : "Profilin henüz zayıf";

  /* -------------------------------------------------------------- */

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Text style={[styles.title, { color: T.textColor }]}>
        Profil Sağlığı
      </Text>

      <Text style={{ color: T.mutedText, marginBottom: 10 }}>
        {level}
      </Text>

      {/* Progress */}
      <View style={[styles.progressBg, { backgroundColor: T.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${score}%`,
              backgroundColor: T.accent,
            },
          ]}
        />
      </View>

      {/* Hints (max 2) */}
      {hints.slice(0, 2).map((h, i) => (
        <Text
          key={i}
          style={{ color: T.mutedText, marginTop: 6, fontSize: 12 }}
        >
          • {h}
        </Text>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------- */

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },

  title: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  progressBg: {
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    borderRadius: 6,
  },
});