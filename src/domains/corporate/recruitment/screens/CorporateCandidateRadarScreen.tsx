// src/domains/corporate/recruitment/screens/CorporateCandidateRadarScreen.tsx
// 🔒 CORPORATE CANDIDATE RADAR (STABLE FINAL)

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCompany } from "../../hooks/useCompany";
import { corporateJobService } from "../../jobs/services/corporateJobService";

/* ================= TYPES ================= */

type Candidate = {
  id: string;
  name: string;
  email: string;
  coverLetter?: string;
  createdAt: number;
};

type RankedCandidate = Candidate & {
  score: number;
};

/* ================= SCORE ENGINE ================= */

function calculateScore(candidate: Candidate) {
  let score = 50;

  if (candidate.coverLetter && candidate.coverLetter.length > 40) {
    score += 20;
  }

  const age = Date.now() - candidate.createdAt;

  if (age < 1000 * 60 * 60 * 24 * 2) {
    score += 15;
  }

  score += Math.random() * 10;

  return Math.round(score);
}

/* ================= SCREEN ================= */

export default function CorporateCandidateRadarScreen() {
  const T = useAppTheme();

  const { company } = useCompany("c1");

  /* ================= APPLICATIONS ================= */

  const allApplications =
    typeof (corporateJobService as any).getAllApplications === "function"
      ? (corporateJobService as any).getAllApplications()
      : [];

  const companyApplications = allApplications.filter(
    (a: any) => a.companyId === company?.id
  );

  const rankedCandidates: RankedCandidate[] = companyApplications
    .map((app: any): RankedCandidate => {
      const candidate: Candidate = {
        id: String(app.id),
        name: app.fullName,
        email: app.email,
        coverLetter: app.coverLetter,
        createdAt: Number(app.createdAt),
      };

      return {
        ...candidate,
        score: calculateScore(candidate),
      };
    })
    .sort((a: RankedCandidate, b: RankedCandidate) => b.score - a.score);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.backgroundColor }}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            color: T.textColor,
          }}
        >
          Candidate Radar
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 13,
            fontWeight: "600",
            color: T.mutedText,
          }}
        >
          En uygun adaylar
        </Text>
      </View>

      {/* LIST */}

      {rankedCandidates.length === 0 ? (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Ionicons name="scan-outline" size={28} color={T.mutedText} />

          <Text
            style={{
              marginTop: 10,
              fontWeight: "700",
              color: T.mutedText,
            }}
          >
            Henüz aday yok
          </Text>
        </View>
      ) : (
        rankedCandidates.map((candidate) => (
          <TouchableOpacity
            key={candidate.id}
            style={{
              padding: 14,
              marginBottom: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.cardBg,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: T.textColor,
              }}
            >
              {candidate.name}
            </Text>

            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                color: T.mutedText,
              }}
            >
              {candidate.email}
            </Text>

            {candidate.coverLetter ? (
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: T.mutedText,
                }}
                numberOfLines={2}
              >
                {candidate.coverLetter}
              </Text>
            ) : null}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Ionicons name="scan" size={14} color={T.accent} />

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: T.textColor,
                  marginLeft: 6,
                }}
              >
                Radar Score: {candidate.score}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}