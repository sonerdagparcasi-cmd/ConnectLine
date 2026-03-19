import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useCompany } from "../../hooks/useCompany";
import { jobService } from "../services/jobService";
import { JobType } from "../types/job.types";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: "Tam Zamanlı", value: "full-time" },
  { label: "Yarı Zamanlı", value: "part-time" },
  { label: "Uzaktan", value: "remote" },
  { label: "Sözleşmeli", value: "contract" },
];

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function JobCreateScreen() {
  const { company } = useCompany("c1");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<JobType>("full-time");
  const [skills, setSkills] = useState("");

  /* ---------------- GUARD ---------------- */

  if (!company) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "700" }}>
          Şirket bilgisi bulunamadı.
        </Text>
      </View>
    );
  }

  /* ---------------- ACTION ---------------- */

  async function onCreate() {
  const currentCompany = company;

  if (!currentCompany) return;
  if (!title.trim() || !desc.trim()) return;

  await jobService.create({
    id: Date.now().toString(),
    companyId: currentCompany.id,
      title: title.trim(),
      description: desc.trim(),
      location: location.trim(),
      jobType,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      createdAt: Date.now(),
      isActive: true,
    });

    setTitle("");
    setDesc("");
    setLocation("");
    setSkills("");
  }

  /* ---------------- UI ---------------- */

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>
        Yeni İş İlanı
      </Text>

      <Field label="Başlık">
        <TextInput value={title} onChangeText={setTitle} />
      </Field>

      <Field label="Açıklama">
        <TextInput
          value={desc}
          onChangeText={setDesc}
          multiline
          style={{ minHeight: 100 }}
        />
      </Field>

      <Field label="Konum">
        <TextInput value={location} onChangeText={setLocation} />
      </Field>

      <Field label="İş Tipi">
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {JOB_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setJobType(t.value)}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: jobType === t.value ? "#000" : "#eee",
              }}
            >
              <Text
                style={{
                  color: jobType === t.value ? "#fff" : "#000",
                  fontWeight: "700",
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Beceriler (virgülle)">
        <TextInput value={skills} onChangeText={setSkills} />
      </Field>

      <TouchableOpacity
        onPress={onCreate}
        style={{
          marginTop: 20,
          backgroundColor: "#000",
          padding: 16,
          borderRadius: 14,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          İlanı Yayınla
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* UI HELPERS                                                         */
/* ------------------------------------------------------------------ */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "700" }}>{label}</Text>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 10,
        }}
      >
        {children}
      </View>
    </View>
  );
}