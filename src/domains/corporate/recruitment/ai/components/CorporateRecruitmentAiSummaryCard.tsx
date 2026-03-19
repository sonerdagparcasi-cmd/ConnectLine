// src/domains/corporate/recruitment/ai/components/CorporateRecruitmentAiSummaryCard.tsx
// 🔒 ADIM 25.1 — Recruitment AI (Aday Tarafı) / Özet Kartı
// Kurallar:
// - UI-only
// - Aday puanı / sıralama / eleme YOK
// - Zorlamaz, rehberlik eder
// - Owner World içinde, İlan Detayı → Adaylar bölümüne gömülmek için tasarlandı

import { useMemo } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "../../../../../shared/theme/appTheme";
import CorporateAiInsightCard from "../../../ai/components/CorporateAiInsightCard";

type CandidateLite = {
  id: string;
  yearsExperience?: number | string | null;
  skills?: string[] | string | null;
  location?: string | null;
};

type Props = {
  jobTitle?: string;
  jobSkills?: string[];
  candidates: CandidateLite[];
  showWhenEmpty?: boolean;
};

function toNum(v?: number | string | null) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && !isNaN(v)) return v;
  const s = String(v).replace(",", ".").match(/(\d+(\.\d+)?)/);
  if (!s?.[1]) return null;
  const n = Number(s[1]);
  return isNaN(n) ? null : n;
}

function toSkills(v?: string[] | string | null) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeSkill(s: string) {
  return s.trim().toLowerCase();
}

export default function CorporateRecruitmentAiSummaryCard({
  jobTitle,
  jobSkills,
  candidates,
  showWhenEmpty = false,
}: Props) {
  const T = useAppTheme();

  const insights = useMemo(() => {
    const list = Array.isArray(candidates) ? candidates : [];
    const count = list.length;

    if (count === 0) {
      return {
        header: {
          title: "AI Değerlendirme Özeti",
          subtitle: "Aday havuzu oluştuğunda burada yorumlar görünecek.",
        },
        cards: showWhenEmpty
          ? [
              {
                title: "Henüz aday yok",
                message:
                  "İlan yayınlandıktan sonra aday geldikçe bu alan otomatik olarak anlamlı öneriler gösterecek.",
                level: "info" as const,
              },
            ]
          : [],
      };
    }

    let junior = 0;
    let mid = 0;
    let senior = 0;
    let unknown = 0;

    const expected = (jobSkills ?? []).map(normalizeSkill).filter(Boolean);
    let totalMatch = 0;

    const locSet = new Set<string>();

    for (const c of list) {
      const y = toNum(c.yearsExperience);
      if (y === null) unknown++;
      else if (y < 2) junior++;
      else if (y < 5) mid++;
      else senior++;

      const candSkills = toSkills(c.skills).map(normalizeSkill);
      if (expected.length) {
        let match = 0;
        for (const e of expected) {
          if (candSkills.includes(e)) match++;
        }
        totalMatch += match;
      }

      const loc = (c.location ?? "").trim();
      if (loc) locSet.add(loc.toLowerCase());
    }

    const title = jobTitle
      ? `AI Değerlendirme Özeti — ${jobTitle}`
      : "AI Değerlendirme Özeti";

    const expMessage =
      junior || mid || senior
        ? `Başvurularda ağırlık: ${
            junior ? "junior " : ""
          }${mid ? "mid-level " : ""}${senior ? "senior " : ""}adaylar.`
        : "Deneyim bilgisi sınırlı görünüyor.";

    const matchRatio =
      expected.length > 0 ? totalMatch / (count * expected.length) : 0;

    const matchMessage =
      expected.length === 0
        ? "İlan becerileri belirtilmemiş."
        : matchRatio >= 0.7
        ? "Aday havuzu ilan becerileriyle genel olarak uyumlu."
        : matchRatio >= 0.4
        ? "İlan–aday uyumu orta seviyede."
        : "Uyum düşük görünüyor. İlan metni netleştirilebilir.";

    const reachMessage =
      locSet.size <= 1
        ? "Başvurular tek bir bölgeden yoğunlaşıyor olabilir."
        : "Başvurular farklı bölgelerden geliyor.";

    return {
      header: {
        title,
        subtitle: `${count} başvuru üzerinden genel yorum.`,
      },
      cards: [
        {
          title: "Aday profili dağılımı",
          message: expMessage,
          level: "info" as const,
        },
        {
          title: "İlan–aday uyumu",
          message: matchMessage,
          level:
            matchRatio >= 0.7
              ? ("success" as const)
              : matchRatio >= 0.4
              ? ("info" as const)
              : ("warning" as const),
        },
        {
          title: "Görünürlük sinyali",
          message: reachMessage,
          level: locSet.size > 1 ? ("success" as const) : ("info" as const),
        },
      ],
    };
  }, [candidates, jobTitle, jobSkills, showWhenEmpty]);

  if (!insights.cards.length) return null;

  return (
    <View
      style={{
        backgroundColor: T.cardBg,
        borderColor: T.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
      }}
    >
      <Text style={{ color: T.textColor, fontWeight: "900", marginBottom: 4 }}>
        {insights.header.title}
      </Text>
      <Text style={{ color: T.mutedText, fontWeight: "700", marginBottom: 12 }}>
        {insights.header.subtitle}
      </Text>

      {insights.cards.map((c, idx) => (
        <CorporateAiInsightCard
          key={`${idx}-${c.title}`}
          title={c.title}
          message={c.message}
          level={c.level}
        />
      ))}
    </View>
  );
}