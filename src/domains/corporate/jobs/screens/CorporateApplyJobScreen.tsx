// src/domains/corporate/jobs/screens/CorporateApplyJobScreen.tsx
// 🔒 Corporate Job Applications Screen (STABLE FINAL – UNIFIED)

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
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
import { corporateJobService } from "../services/corporateJobService";

type RouteParams =
  | { mode: "apply"; jobId: string }
  | { mode: "my" }
  | { mode: "inbox" };

const KEY_LAST_APPLY_EMAIL = "@corporate_last_apply_email.v1";

function normEmail(v: string) {
  return String(v ?? "").trim().toLowerCase();
}

export default function CorporateApplyJobScreen({ route, navigation }: any) {
  const T = useAppTheme();
  const params: RouteParams = route?.params ?? { mode: "my" };

  const { type, hasIdentity } = useCorporateIdentity();
  const { company, isOwner } = useCompany("c1");

  const [loaded, setLoaded] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cover, setCover] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  /* ------------------------------------------------ */
  /* EMAIL LOAD                                        */
  /* ------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(KEY_LAST_APPLY_EMAIL);
        if (mounted) setStoredEmail(stored ?? "");
      } catch {
        if (mounted) setStoredEmail("");
      } finally {
        if (mounted) setLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------ */
  /* ALL APPLICATIONS                                  */
  /* ------------------------------------------------ */

  const allApplications = useMemo(() => {
    if (
      typeof (corporateJobService as any).getAllApplications === "function"
    ) {
      return (corporateJobService as any).getAllApplications();
    }

    return [];
  }, [refreshKey]);

  /* ------------------------------------------------ */
  /* MY APPLICATIONS                                   */
  /* ------------------------------------------------ */

  const myApps = useMemo(() => {
    const email = normEmail(storedEmail);

    if (!email) return [];

    return allApplications
      .filter((a: any) => normEmail(a.email) === email)
      .sort((a: any, b: any) => Number(b.createdAt) - Number(a.createdAt));
  }, [allApplications, storedEmail]);

  /* ------------------------------------------------ */
  /* COMPANY INBOX                                     */
  /* ------------------------------------------------ */

  const companyApps = useMemo(() => {
    if (!company) return [];

    return allApplications.filter((a: any) => a.companyId === company.id);
  }, [allApplications, company]);

  /* ------------------------------------------------ */
  /* APPLY ACTION                                      */
  /* ------------------------------------------------ */

  async function onSubmit(jobId: string) {
    if (!name || !email || submitting) return;

    setSubmitting(true);

    await corporateJobService.applyJob({
      jobId,
      fullName: name,
      email,
      coverLetter: cover,
    });

    try {
      await AsyncStorage.setItem(KEY_LAST_APPLY_EMAIL, normEmail(email));
    } catch {}

    setSubmitted(true);
    setRefreshKey((p) => p + 1);
  }

  /* ================================================================ */
  /* MODE: MY                                                          */
  /* ================================================================ */

  if (params.mode === "my") {
    if (!hasIdentity) {
      return (
        <Blocked
          T={T}
          title="Başvurularını görebilmek için önce bireysel kimlik oluşturmalısın."
          button="Kimlik Oluştur"
          onPress={() => navigation.navigate("CorporateIdentitySelect")}
        />
      );
    }

    if (type !== "individual") {
      return (
        <Blocked
          T={T}
          title="Başvurularım sadece bireysel kimlik ile kullanılabilir."
          button="Bireysel Kimlik Seç"
          onPress={() => navigation.navigate("CorporateIdentitySelect")}
        />
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
        <CorporateTopBar title="Başvurularım" />

        {!loaded ? (
          <EmptyState T={T} title="Yükleniyor..." />
        ) : myApps.length === 0 ? (
          <EmptyState
            T={T}
            title="Henüz başvuru yok"
            subtitle="Başvuru yaptıktan sonra burada görünecek."
          />
        ) : (
          <FlatList
            data={myApps}
            keyExtractor={(x) => String(x.id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <ApplicationCard item={item} T={T} />
            )}
          />
        )}
      </View>
    );
  }

  /* ================================================================ */
  /* MODE: APPLY                                                       */
  /* ================================================================ */

  if (params.mode === "apply") {
    const jobId = params.jobId;

    if (submitted) {
      return (
        <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
          <CorporateTopBar title="Başvuru Gönderildi" />

          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Ionicons name="checkmark-circle" size={60} color={T.accent} />

            <Text style={{ color: T.textColor, fontWeight: "900" }}>
              Başvurun başarıyla gönderildi
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CorporateApplyJob", { mode: "my" })
              }
            >
              <Text style={{ color: T.accent, fontWeight: "900" }}>
                Başvurularımı Gör
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
        <CorporateTopBar title={t("corporate.applyJob.title")} />

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Label T={T} text="Ad Soyad" />
          <Input T={T} value={name} onChangeText={setName} />

          <Label T={T} text="Email" />
          <Input T={T} value={email} onChangeText={setEmail} />

          <Label T={T} text="Ön Yazı" />
          <Input T={T} value={cover} onChangeText={setCover} multiline />

          <TouchableOpacity
            onPress={() => onSubmit(jobId)}
            style={{
              marginTop: 16,
              backgroundColor: T.accent,
              padding: 12,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              Başvuruyu Gönder
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================ */
  /* MODE: INBOX                                                       */
  /* ================================================================ */

  if (type !== "company" || !company || !isOwner) {
    return (
      <Blocked
        T={T}
        title="Başvurular sadece firma sahibine görünür."
        button="Geri"
        onPress={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title="Başvurular" />

      {companyApps.length === 0 ? (
        <EmptyState
          T={T}
          title="Henüz başvuru yok"
          subtitle="İlanlarına gelen başvurular burada görünecek."
        />
      ) : (
        <FlatList
          data={companyApps}
          keyExtractor={(x) => String(x.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ApplicationCard item={item} T={T} />
          )}
        />
      )}
    </View>
  );
}

/* ================================================================ */
/* COMPONENTS                                                        */
/* ================================================================ */

function ApplicationCard({ item, T }: any) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: T.cardBg,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: T.border,
      }}
    >
      <Text style={{ color: T.textColor, fontWeight: "900" }}>
        {item.fullName}
      </Text>

      <Text style={{ color: T.mutedText }}>{item.email}</Text>

      {item.coverLetter && (
        <Text style={{ marginTop: 6, color: T.mutedText }}>
          {item.coverLetter}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------ */
/* BLOCKED                                          */
/* ------------------------------------------------ */

function Blocked({ T, title, button, onPress }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: T.backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <Ionicons name="lock-closed" size={40} color={T.mutedText} />

      <Text
        style={{
          marginTop: 16,
          color: T.textColor,
          textAlign: "center",
          fontWeight: "800",
        }}
      >
        {title}
      </Text>

      <TouchableOpacity
        onPress={onPress}
        style={{
          marginTop: 18,
          backgroundColor: T.accent,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900" }}>{button}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------------ */
/* EMPTY STATE                                      */
/* ------------------------------------------------ */

function EmptyState({ T, title, subtitle }: any) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <Text style={{ color: T.textColor, fontWeight: "900" }}>{title}</Text>

      {subtitle && (
        <Text
          style={{
            marginTop: 8,
            color: T.mutedText,
            textAlign: "center",
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------ */
/* LABEL                                            */
/* ------------------------------------------------ */

function Label({ T, text }: any) {
  return (
    <Text
      style={{
        color: T.textColor,
        fontWeight: "800",
        marginTop: 12,
        marginBottom: 4,
      }}
    >
      {text}
    </Text>
  );
}

/* ------------------------------------------------ */
/* INPUT                                            */
/* ------------------------------------------------ */

function Input({ T, multiline, ...props }: any) {
  return (
    <TextInput
      {...props}
      multiline={multiline}
      style={{
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.cardBg,
        borderRadius: 12,
        padding: 10,
        minHeight: multiline ? 90 : 44,
        color: T.textColor,
      }}
    />
  );
}