// src/domains/corporate/jobs/screens/CorporateCreateJobScreen.tsx
// 🔒 Corporate Job Create (UI-only, FINAL & LOCKED)
// ADIM 4.1: Identity + Owner + Completion Guard (HARD ENFORCE)
// ADIM 6: Success Feedback + Next Step UX (NO goBack)
//
// ✅ STABLE FIX:
// - %80 completion döngüsü tamamen çözüldü
// - completion artık profileView + company üzerinden hesaplanır
// - useCompany completion varsa onu kullanır (geri uyumluluk)
// - submitting state güvenli
// - mimari korunur (UI-only)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporateTopBar from "../../components/CorporateTopBar";
import { useCompany } from "../../hooks/useCompany";
import { useCorporateIdentity } from "../../identity/hook/useCorporateIdentity";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import { corporateJobService } from "../services/corporateJobService";
import type { JobType } from "../types/job.types";

type Nav = NativeStackNavigationProp<CorporateStackParamList>;

const JOB_TYPES: { key: JobType; label: string }[] = [
  { key: "full_time", label: "Full-time" },
  { key: "part_time", label: "Part-time" },
  { key: "contract", label: "Contract" },
  { key: "internship", label: "Internship" },
];

/* ------------------------------------------------------------------ */
/* COMPLETION                                                         */
/* ------------------------------------------------------------------ */

function norm(v: unknown) {
  return String(v ?? "").trim();
}

function hasText(v: unknown) {
  return norm(v).length > 0;
}

function computeCompanyCompletion(input: {
  companyName?: string;
  title?: string;
  description?: string;
  sector?: string;
  location?: string;
  website?: string;
  avatarUri?: string | null;
}) {
  const checks = [
    hasText(input.companyName),
    hasText(input.title),
    hasText(input.description),
    hasText(input.sector),
    hasText(input.location),
    hasText(input.website),
    hasText(input.avatarUri),
  ];

  const done = checks.filter(Boolean).length;
  const total = checks.length;

  const percent = Math.round((done / total) * 100);

  return { percent, done, total };
}

export default function CorporateCreateJobScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const { type, hasIdentity } = useCorporateIdentity();

  const companyId = "c1";

  const companyCtx: any = useCompany(companyId);

  const company = companyCtx?.company ?? null;
  const isOwner = !!companyCtx?.isOwner;
  const profileView = companyCtx?.profileView ?? null;

  /* ---------------- STATE ---------------- */

  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- FORM ---------------- */

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Remote");
  const [jobType, setJobType] = useState<JobType>("full_time");
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  const [skillsText, setSkillsText] = useState("React Native, TypeScript");

  const skills = useMemo(
    () =>
      skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
    [skillsText]
  );

  const canSubmit = useMemo(
    () =>
      !submitting &&
      title.trim().length > 0 &&
      location.trim().length > 0 &&
      description.trim().length > 0,
    [title, location, description, submitting]
  );

  /* ---------------- COMPLETION ---------------- */

  const completion = useMemo(() => {
    const fromHook = companyCtx?.completion;
    if (fromHook?.percent) return fromHook;

    return computeCompanyCompletion({
      companyName: profileView?.displayName || company?.name,
      title: profileView?.displayTitle || company?.title,
      description: profileView?.about || company?.description,
      sector: company?.sector,
      location: company?.location,
      website: company?.website,
      avatarUri: profileView?.avatarUri,
    });
  }, [
    companyCtx?.completion,
    profileView,
    company?.name,
    company?.title,
    company?.description,
    company?.sector,
    company?.location,
    company?.website,
  ]);

  /* ---------------- GUARDS ---------------- */

  if (!hasIdentity) {
    return (
      <GuardScreen
        T={T}
        title="İlan oluşturmak için önce kurumsal kimlik oluşturmalısın."
        button="Kimlik Oluştur"
        onPress={() => navigation.navigate("CorporateIdentitySelect")}
      />
    );
  }

  if (type !== "company") {
    return (
      <GuardScreen
        T={T}
        title="İlan yayınlamak için Şirket Kimliği gerekir."
        button="Şirket Kimliği Seç"
        onPress={() => navigation.navigate("CorporateIdentitySelect")}
      />
    );
  }

  if (!company || !isOwner) {
    return (
      <GuardScreen
        T={T}
        title={t("corporate.ownerOnly")}
        button="Geri"
        onPress={() => navigation.goBack()}
      />
    );
  }

  if (!completion || completion.percent < 80) {
    return (
      <GuardScreen
        T={T}
        title="İlan açabilmek için şirket profilini en az %80 tamamlamalısın."
        subtitle={`Şu an: %${completion.percent}`}
        button="Profili Tamamla"
        onPress={() => navigation.navigate("CorporateHome")}
      />
    );
  }

  /* ---------------- ACTION ---------------- */

  async function onCreate() {
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      if (!company) return;

      const job = await corporateJobService.createJob({
        companyId: company.id,
        companyName: company.name,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        jobType,
        salaryRange: salaryRange.trim() || undefined,
        skills,
      });

      setCreatedJobId(job.id);
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------- SUCCESS ---------------- */

  if (createdJobId) {
    return (
      <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
        <CorporateTopBar title="İlan Yayınlandı" />

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            gap: 16,
          }}
        >
          <Ionicons name="checkmark-circle" size={64} color={T.accent} />

          <Text
            style={{
              color: T.textColor,
              fontSize: 18,
              fontWeight: "900",
              textAlign: "center",
            }}
          >
            İlanın başarıyla yayınlandı 🎉
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CorporateJobDetail", { jobId: createdJobId })
            }
            style={{
              backgroundColor: T.accent,
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              İlanı Görüntüle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------------- FORM ---------------- */

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title={t("corporate.jobs.create")} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <BackRow T={T} onBack={() => navigation.goBack()} title="Yeni İlan" />

        <Field T={T} label="Pozisyon" value={title} onChangeText={setTitle} />
        <Field T={T} label="Lokasyon" value={location} onChangeText={setLocation} />

        <Field
          T={T}
          label="Maaş Aralığı (opsiyonel)"
          value={salaryRange}
          onChangeText={setSalaryRange}
        />

        <Field
          T={T}
          label="Açıklama"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Field
          T={T}
          label="Yetenekler"
          value={skillsText}
          onChangeText={setSkillsText}
        />

        <TouchableOpacity
          onPress={onCreate}
          disabled={!canSubmit}
          style={{
            marginTop: 16,
            backgroundColor: canSubmit ? T.accent : T.border,
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>
            {submitting ? "Yayınlanıyor..." : "İlanı Oluştur"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------------- HELPERS ---------------- */

function GuardScreen({ T, title, subtitle, button, onPress }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title="" />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          gap: 12,
        }}
      >
        <Text style={{ color: T.textColor, fontWeight: "900", textAlign: "center" }}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={{ color: T.mutedText, textAlign: "center" }}>
            {subtitle}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: T.accent,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>{button}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BackRow({ T, onBack, title }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
        <Ionicons name="arrow-back" size={22} color={T.isDark ? "#fff" : "#000"} />
      </TouchableOpacity>
      <Text style={{ color: T.textColor, fontWeight: "900" }}>{title}</Text>
    </View>
  );
}

function Field({ T, label, value, onChangeText, multiline }: any) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={{ color: T.mutedText, marginBottom: 6 }}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={{
          borderWidth: 1,
          borderColor: T.border,
          backgroundColor: T.cardBg,
          color: T.textColor,
          borderRadius: 14,
          padding: 10,
          minHeight: multiline ? 100 : undefined,
        }}
      />
    </View>
  );
}