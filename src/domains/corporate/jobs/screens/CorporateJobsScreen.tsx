// src/domains/corporate/jobs/screens/CorporateJobsScreen.tsx
// 🔒 ADIM 10 — Job List CTA / Quick Access
// Kurallar:
// - Liste keşif alanıdır
// - CTA kimliğe göre bağlanır
// - Guard'lar Create / Apply ekranlarında kalır
// - UI-only, yeni dosya yok

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporateTopBar from "../../components/CorporateTopBar";
import { useCompany } from "../../hooks/useCompany";
import { useCorporateIdentity } from "../../identity/hook/useCorporateIdentity";
import JobCard from "../components/JobCard";
import { useCorporateJobs } from "../hooks/useCorporateJobs";

export default function CorporateJobsScreen({ navigation }: any) {
  const T = useAppTheme();
  const nav = useNavigation<any>();

  const { type } = useCorporateIdentity();
  const { company, isOwner } = useCompany("c1");
  const { jobs } = useCorporateJobs();

  /* ------------------------------------------------------------------ */
  /* CTA RESOLVER (🔒 ADIM 10)                                           */
  /* ------------------------------------------------------------------ */

  function resolveCTA(job: any):
    | { label: string; onPress: () => void }
    | null {
    // 👤 Bireysel → Apply
    if (type === "individual") {
      return {
        label: "Başvur",
        onPress: () =>
          nav.navigate("CorporateApplyJob", {
            mode: "apply",
            jobId: job.id,
          }),
      };
    }

    // 🏢 Firma Sahibi → Inbox (kendi ilanı)
    if (type === "company" && company && isOwner && job.companyId === company.id) {
      return {
        label: "Başvuruları Gör",
        onPress: () =>
          nav.navigate("CorporateApplyJob", {
            mode: "inbox",
          }),
      };
    }

    return null;
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title={t("corporate.tab.jobs")} />

      <FlatList
        data={jobs}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        renderItem={({ item }) => {
          const cta = resolveCTA(item);

          return (
            <View style={{ marginBottom: 14 }}>
              <JobCard
                job={item}
                onPress={() =>
                  navigation.navigate("CorporateJobDetail", {
                    jobId: item.id,
                  })
                }
              />

              {cta ? (
                <TouchableOpacity
                  onPress={cta.onPress}
                  activeOpacity={0.88}
                  style={{
                    marginTop: 8,
                    alignSelf: "flex-end",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: T.accent,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>
                    {cta.label}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
      />

      {/* ================= FAB — CREATE JOB ================= */}
      {type === "company" && isOwner ? (
        <TouchableOpacity
          onPress={() => navigation.navigate("CorporateCreateJob")}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: T.accent,
          }}
          activeOpacity={0.88}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}