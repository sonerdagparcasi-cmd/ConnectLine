// src/domains/corporate/screens/CorporateProfileContainerScreen.tsx
// 🔒 CORPORATE PROFILE VITRINE – STABLE FINAL (PROFILE FIELDS EXTENDED)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import ProfileVisitorActions from "../components/ProfileVisitorActions";
import SimilarCompanies from "../components/SimilarCompanies";
import { useCompany } from "../hooks/useCompany";
import { refreshCorporateUnreadSubscribers } from "../services/corporateNotificationService";
import { syncCorporateViewerFromCompanyRole } from "../services/corporateViewerIdentity";

function norm(v: unknown) {
  return String(v ?? "").trim();
}

export default function CorporateProfileContainerScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();

  const stableCompanyId = useMemo(() => {
    const id = route?.params?.companyId;
    return id ? id : "c1";
  }, [route?.params?.companyId]);

  const {
    company,
    profileView,
    isOwner,
    visibility,
    derived,
    isFollowing,
    toggleFollow,
  } = useCompany(stableCompanyId);

  useEffect(() => {
    syncCorporateViewerFromCompanyRole(isOwner, stableCompanyId);
    refreshCorporateUnreadSubscribers();
  }, [isOwner, stableCompanyId]);

  const isPrivateForVisitor = visibility === "private" && !isOwner;
  const canShowVisitorActions = isOwner || visibility === "public";

  if (!company || !profileView || isPrivateForVisitor) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: T.backgroundColor,
        }}
      >
        <Ionicons
          name="lock-closed-outline"
          size={28}
          color={T.mutedText}
          style={{ marginBottom: 10 }}
        />

        <Text
          style={{
            color: T.mutedText,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Bu kurumsal profil şu anda gizli.
        </Text>
      </View>
    );
  }

  const displayName = norm(profileView.displayName) || norm(company.name);

  const displayTitle =
    norm(profileView.displayTitle) ||
    norm(company.sector) ||
    norm(profileView.career);

  const followers = derived?.followers ?? 0;
  const mutualConnections = derived?.mutualConnections ?? 0;

  const employees = company.employeeCount ?? 0;
  const activeJobs = 12;

  const growth30 = Math.round(followers * 0.07);

  const recruiterStatus =
    activeJobs > 0
      ? { icon: "ellipse", text: "Yeni başvurular var", color: "#10fd08" }
      : {
          icon: "ellipse-outline",
          text: "Şu anda işe alım yok",
          color: T.mutedText,
        };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.backgroundColor }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <LinearGradient
        colors={
          T.isDark
            ? (["#000000", "#1834ae"] as const)
            : (["#ffffff", "#00bfff"] as const)
        }
        style={{
          paddingTop: 30,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* LEFT */}

          <View style={{ width: 150 }}>
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 26,
                borderWidth: 3,
                borderColor: "#fff",
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              {profileView.avatarUri ? (
                <Image
                  source={{ uri: profileView.avatarUri }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: T.cardBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="business" size={36} color={T.textColor} />
                </View>
              )}
            </View>

            <Text
              style={{
                fontWeight: "900",
                fontSize: 18,
                color: T.textColor,
              }}
            >
              {displayName}
            </Text>

            {displayTitle ? (
              <Text
                style={{
                  marginTop: 4,
                  marginBottom: 6,
                  color: T.mutedText,
                  fontWeight: "700",
                }}
              >
                {displayTitle}
              </Text>
            ) : null}

            {isOwner && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name={recruiterStatus.icon as any}
                  size={10}
                  color={recruiterStatus.color}
                />

                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    color: recruiterStatus.color,
                    fontWeight: "700",
                  }}
                >
                  {recruiterStatus.text}
                </Text>
              </View>
            )}
          </View>

          {/* RIGHT */}

          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text
              style={{
                color: T.textColor,
                fontWeight: "800",
                fontSize: 15,
                marginBottom: 12,
              }}
            >
              👥 {followers} takipçi
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Metric text={`🏢 ${employees} çalışan`} T={T} />
              <Metric text={`📢 ${activeJobs} aktif ilan`} T={T} />
            </View>

            <Text
              style={{
                color: T.textColor,
                fontWeight: "700",
                fontSize: 13,
                marginBottom: 10,
              }}
            >
              📈 son 30 gün +{growth30} takipçi
            </Text>

            <Text
              style={{
                color: T.textColor,
                fontWeight: "700",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              👤 {mutualConnections} ortak bağlantı
            </Text>

            {!isOwner && (
              <TouchableOpacity
                onPress={toggleFollow}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: isFollowing ? T.cardBg : T.accent,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 18,
                  borderWidth: isFollowing ? 1 : 0,
                  borderColor: T.border,
                }}
              >
                <Text
                  style={{
                    color: isFollowing ? T.textColor : "#fff",
                    fontWeight: "800",
                    fontSize: 12,
                  }}
                >
                  {isFollowing ? "✓ Takibi bırak" : "+ Takip Et"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* OWNER HUB */}

      {isOwner && <OwnerActionHub nav={nav} T={T} />}

      {/* PROFILE INFO */}

      <ProfileInfoBlock profileView={profileView} T={T} />

      {/* VISITOR */}

      {canShowVisitorActions && (
        <ProfileVisitorActions
          companyId={stableCompanyId}
          isOwner={isOwner}
          website={company?.website}
        />
      )}

      <SimilarCompanies
        currentCompanyId={company.id}
        sector={company.sector}
        onOpen={(nextCompanyId: string) =>
          nav.navigate("CorporateProfile", { companyId: nextCompanyId })
        }
      />
    </ScrollView>
  );
}

function Metric({ text, T }: any) {
  return (
    <Text
      style={{
        color: T.textColor,
        fontWeight: "700",
        fontSize: 13,
      }}
    >
      {text}
    </Text>
  );
}

function ProfileInfoBlock({ profileView, T }: any) {
  const location = `${norm(profileView.city)} ${norm(profileView.country)}`.trim();

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: T.border,
          backgroundColor: T.cardBg,
        }}
      >
        <Text style={{ fontWeight: "900", marginBottom: 12, color: T.textColor }}>
          Profil Bilgileri
        </Text>

        {location ? <Info text={`📍 ${location}`} T={T} /> : null}

        {profileView.school ? <Info text={`🎓 ${profileView.school}`} T={T} /> : null}

        {profileView.currentRole ? (
          <Info text={`💼 ${profileView.currentRole}`} T={T} />
        ) : null}

        {profileView.displayTitle ? (
          <Info text={`👔 ${profileView.displayTitle}`} T={T} />
        ) : null}

        {profileView.currentCompany ? (
          <Info text={`🏢 ${profileView.currentCompany}`} T={T} />
        ) : null}

        {profileView.focusAreas?.length > 0 ? (
          <Info text={`🧠 ${profileView.focusAreas.join(" • ")}`} T={T} />
        ) : null}

        {profileView.highlights?.length > 0 ? (
          <Info text={`⭐ ${profileView.highlights.join(" • ")}`} T={T} />
        ) : null}

        {profileView.about ? <Info text={`📝 ${profileView.about}`} T={T} /> : null}
      </View>
    </View>
  );
}

function Info({ text, T }: any) {
  return (
    <Text
      style={{
        color: T.textColor,
        marginBottom: 14,
        fontWeight: "600",
      }}
    >
      {text}
    </Text>
  );
}

function OwnerActionHub({ nav, T }: any) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: T.border,
          backgroundColor: T.cardBg,
        }}
      >
        <Text
          style={{
            fontWeight: "900",
            fontSize: 13,
            marginBottom: 12,
            color: T.textColor,
          }}
        >
          Hızlı İşlemler
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Action icon="home" label="Home" onPress={() => nav.navigate("CorporateHome")} T={T} accent />
          <Action icon="add-circle" label="İlan oluştur" onPress={() => nav.navigate("CorporateCreateJob")} T={T} />
          <Action icon="briefcase" label="İlanlar" onPress={() => nav.navigate("CorporateJobs")} T={T} />
          <Action icon="mail" label="Başvurular" onPress={() => nav.navigate("CorporateApplyJob",{mode:"inbox"})} T={T} />
          <Action icon="scan" label="Aday Radar" onPress={() => nav.navigate("CorporateCandidateRadar")} T={T} />
          <Action icon="people" label="Kurumsal Ağ" onPress={() => nav.navigate("CorporateTabs",{screen:"CorporateTabNetwork"})} T={T} />
          <Action icon="chatbubble-ellipses" label="Gelen Kutusu" onPress={() => nav.navigate("CorporateTabs",{screen:"CorporateTabInbox"})} T={T} />
          <Action icon="images" label="Paylaşımlar" onPress={() => nav.navigate("CorporateFeed")} T={T} />
          <Action icon="settings" label="Yönetim" onPress={() => nav.navigate("CorporateHome")} T={T} />
        </View>
      </View>
    </View>
  );
}

function Action({ icon, label, onPress, T, accent }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: "33%",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <Ionicons name={icon} size={22} color={accent ? T.accent : T.textColor} />

      <Text
        style={{
          fontSize: 11,
          marginTop: 4,
          textAlign: "center",
          color: T.textColor,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}