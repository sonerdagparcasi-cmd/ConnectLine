// src/domains/corporate/jobs/screens/CorporateJobDetailScreen.tsx
// 🔒 ADIM 9 — Job Detail CTA Binding (Apply / Inbox)
// Kurallar:
// - Tek dosya
// - UI-only
// - CTA kimliğe göre bağlanır
// - CorporateTopBar contract BOZULMAZ

import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporateTopBar from "../../components/CorporateTopBar";
import { useCompany } from "../../hooks/useCompany";
import { useCorporateIdentity } from "../../identity/hook/useCorporateIdentity";
import { corporateJobService } from "../services/corporateJobService";
import type { CorporateJob } from "../types/job.types";

// 🔒 Recruitment AI Summary (UI-only)
import CorporateRecruitmentAiSummaryCard from "../../recruitment/ai/components/CorporateRecruitmentAiSummaryCard";

/* ------------------------------------------------------------------ */
/* UI-ONLY MOCK FAVORITES                                             */
/* ------------------------------------------------------------------ */

const FAVORITE_JOB_IDS = new Set<string>();

/* ------------------------------------------------------------------ */
/* UI-ONLY MOCK CANDIDATES                                            */
/* ------------------------------------------------------------------ */

const MOCK_CANDIDATES = [
  {
    id: "c1",
    yearsExperience: 1,
    skills: ["React", "TypeScript"],
    location: "İstanbul",
  },
  {
    id: "c2",
    yearsExperience: 4,
    skills: ["React", "Node.js", "SQL"],
    location: "Ankara",
  },
  {
    id: "c3",
    yearsExperience: "6 yıl",
    skills: "React, TypeScript, GraphQL",
    location: "Remote",
  },
];

export default function CorporateJobDetailScreen({ route, navigation }: any) {
  const T = useAppTheme();
  const { jobId } = route.params;

  const { type } = useCorporateIdentity();
  const { company, isOwner } = useCompany("c1");

  const [job, setJob] = useState<CorporateJob | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  /* ------------------------------------------------------------------ */
  /* LOAD JOB                                                           */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    corporateJobService.getJob(jobId).then((j) => {
      setJob(j);
      setIsFavorite(FAVORITE_JOB_IDS.has(jobId));
    });
  }, [jobId]);

  /* ------------------------------------------------------------------ */
  /* FAVORITE (UI-only)                                                 */
  /* ------------------------------------------------------------------ */

  function toggleFavorite() {
    if (FAVORITE_JOB_IDS.has(jobId)) {
      FAVORITE_JOB_IDS.delete(jobId);
      setIsFavorite(false);
    } else {
      FAVORITE_JOB_IDS.add(jobId);
      setIsFavorite(true);
    }
  }

  const favoriteIcon = useMemo(
    () => (isFavorite ? "bookmark" : "bookmark-outline"),
    [isFavorite]
  );

  /* ------------------------------------------------------------------ */
  /* CTA LOGIC (🔒 ADIM 9)                                              */
  /* ------------------------------------------------------------------ */

  const cta = useMemo<{
    label: string;
    onPress: () => void;
  } | null>(() => {
    // 👤 Bireysel → Apply
    if (type === "individual") {
      return {
        label: t("corporate.jobDetail.apply"),
        onPress: () =>
          navigation.navigate("CorporateApplyJob", {
            mode: "apply",
            jobId,
          }),
      };
    }

    // 🏢 Firma Sahibi → Inbox
    if (type === "company" && company && isOwner) {
      return {
        label: "Başvuruları Gör",
        onPress: () =>
          navigation.navigate("CorporateApplyJob", {
            mode: "inbox",
          }),
      };
    }

    // ❌ Diğer durumlar
    return null;
  }, [type, company, isOwner, jobId, navigation]);

  /* ------------------------------------------------------------------ */
  /* EMPTY                                                              */
  /* ------------------------------------------------------------------ */

  if (!job) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: T.mutedText, fontWeight: "800" }}>
          {t("loading")}
        </Text>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      {/* ================= TOP BAR ================= */}
      <CorporateTopBar
        title={t("corporate.jobDetail.title")}
        rightIcon={favoriteIcon}
        onRightPress={toggleFavorite}
      />

      {/* ================= CONTENT ================= */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text
          style={{
            color: T.textColor,
            fontWeight: "900",
            fontSize: 20,
          }}
        >
          {job.title}
        </Text>

        <Text
          style={{
            color: T.mutedText,
            marginTop: 6,
            fontWeight: "700",
          }}
        >
          {job.companyName} • {job.location}
        </Text>

        {/* DESCRIPTION */}
        <Text
          style={{
            color: T.textColor,
            marginTop: 14,
            lineHeight: 20,
            fontWeight: "700",
          }}
        >
          {job.description}
        </Text>

        {/* AI SUMMARY */}
        <View style={{ marginTop: 18 }}>
          <CorporateRecruitmentAiSummaryCard
            jobTitle={job.title}
            jobSkills={job.skills}
            candidates={MOCK_CANDIDATES}
            showWhenEmpty
          />
        </View>

        {/* ================= CTA ================= */}
        {cta ? (
          <TouchableOpacity
            onPress={cta.onPress}
            activeOpacity={0.88}
            style={{
              marginTop: 22,
              backgroundColor: T.accent,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              {cta.label}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}