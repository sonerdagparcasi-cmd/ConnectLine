// src/domains/corporate/recruitment/screens/JobApplicationsScreen.tsx
// 🔒 Recruitment – Job Applications (GLOBAL + JOB MODE)
// - jobId varsa → o ilana gelen başvurular
// - jobId yoksa → kullanıcıya gelen TÜM başvurular
// UI-only, backend varsayımı yok

import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { applicationService } from "../services/applicationService";
import type { JobApplication } from "../types/application.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  jobId?: string;
};

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function JobApplicationsScreen({ jobId }: Props) {
  const navigation = useNavigation<any>();

  const [apps, setApps] = useState<JobApplication[]>([]);
  const isJobMode = typeof jobId === "string" && jobId.length > 0;

  /* ------------------------------------------------------------------ */
  /* LOAD DATA                                                          */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function load() {
      const list = isJobMode
        ? await applicationService.list(jobId!)
        : await applicationService.listAll();

      if (mounted) {
        setApps(list);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [jobId, isJobMode]);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  async function update(id: string, status: JobApplication["status"]) {
    await applicationService.updateStatus(id, status);

    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  function openCandidate(id: string) {
    navigation.navigate("CandidateDetail", { id });
  }

  /* ------------------------------------------------------------------ */
  /* EMPTY STATE                                                        */
  /* ------------------------------------------------------------------ */

  const emptyText = useMemo(() => {
    return isJobMode
      ? "Bu ilana henüz başvuru yok."
      : "Henüz sana gelen bir başvuru yok.";
  }, [isJobMode]);

  /* ------------------------------------------------------------------ */
  /* RENDER ITEM                                                        */
  /* ------------------------------------------------------------------ */

  function renderItem({ item }: { item: JobApplication }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openCandidate(item.id)}
      >
        <View
          style={{
            borderWidth: 1,
            borderRadius: 14,
            padding: 14,
            marginBottom: 12,
            borderColor: "rgba(0,0,0,0.12)",
          }}
        >
          {/* Candidate Name */}

          <Text style={{ fontWeight: "800", fontSize: 15 }}>
            {item.candidateName}
          </Text>

          {/* Job Title (GLOBAL MODE) */}

          {!isJobMode && (
            <Text style={{ marginTop: 4, opacity: 0.7 }}>
              {item.jobTitle}
            </Text>
          )}

          {/* Cover Letter */}

          {item.coverLetter && (
            <Text style={{ marginTop: 8 }}>
              {item.coverLetter}
            </Text>
          )}

          {/* ACTIONS */}

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 12,
            }}
          >
            <Action
              label="Kısa Liste"
              onPress={() => update(item.id, "shortlisted")}
            />

            <Action
              label="Reddet"
              danger
              onPress={() => update(item.id, "rejected")}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <FlatList
      data={apps}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
        flexGrow: apps.length === 0 ? 1 : undefined,
      }}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.6,
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            {emptyText}
          </Text>
        </View>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* ACTION BUTTON                                                      */
/* ------------------------------------------------------------------ */

function Action({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: danger ? "#fee" : "#eee",
      }}
    >
      <Text
        style={{
          fontWeight: "700",
          color: danger ? "#b00020" : "#000",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}