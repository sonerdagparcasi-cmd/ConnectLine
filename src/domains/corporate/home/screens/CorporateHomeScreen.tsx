// src/domains/corporate/home/screens/CorporateHomeScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import AppGradientHeader from "../../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCompany } from "../../hooks/useCompany";
import { corporateProfileDraftStorage } from "../../services/corporateProfileDraftStorage";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";

import CorporateHomeOwnerEditor from "../ui/CorporateHomeOwnerEditor";
import { CorporateIdentityChoice } from "../ui/CorporateIdentityChoice";
import CorporateIndividualProfileInlineForm, {
  IndividualDraft,
} from "../ui/CorporateIndividualProfileInlineForm";

type Nav = NativeStackNavigationProp<CorporateStackParamList>;
type ProfileMode = "company" | "individual";

const INDIVIDUAL_STORAGE_KEY = "corporate:individual_profile_v1";

const EMPTY_INDIVIDUAL: IndividualDraft = {
  avatarUri: null,
  fullName: "",
  headline: "",
  portfolioUrl: "",
  country: "",
  city: "",
  school: "",
  currentCompany: "",
  currentRole: "",
  about: "",
  experience: "",
  focusAreas: [],
  highlights: [],
};

function norm(v: unknown) {
  return String(v ?? "").trim();
}

export default function CorporateHomeScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const { company, isOwner, profileView } = useCompany("c1");

  const [mode, setMode] = useState<ProfileMode | null>(null);
  const isCompanyMode = mode === "company";

  const [individualDraft, setIndividualDraft] =
    useState<IndividualDraft>(EMPTY_INDIVIDUAL);

  const [companyDraft, setCompanyDraft] = useState({
    about: "",
    experience: "",
    focusAreas: [] as string[],
    highlights: [] as string[],
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  /* ------------------------------------------------------------------ */
  /* PREFILL                                                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!profileView || isHydrated) return;

    setAvatarUri(profileView.avatarUri ?? null);

    setCompanyDraft({
      about: norm(profileView.about),
      experience: norm(profileView.career),
      focusAreas: Array.isArray(profileView.focusAreas)
        ? profileView.focusAreas
        : [],
      highlights: Array.isArray(profileView.highlights)
        ? profileView.highlights
        : [],
    });

    setIndividualDraft((prev) => ({
      ...prev,
      avatarUri: profileView.avatarUri ?? null,
      fullName: norm(profileView.displayName),
      headline: norm(profileView.displayTitle),
      about: norm(profileView.about),
      experience: norm(profileView.career),
      focusAreas: Array.isArray(profileView.focusAreas)
        ? profileView.focusAreas
        : [],
      highlights: Array.isArray(profileView.highlights)
        ? profileView.highlights
        : [],
    }));

    setIsHydrated(true);
  }, [profileView, isHydrated]);

  /* ------------------------------------------------------------------ */
  /* AVATAR                                                             */
  /* ------------------------------------------------------------------ */

  const pickAvatar = useCallback(async () => {
    if (!isOwner) return;

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (perm.status !== "granted") {
        Alert.alert("İzin gerekli", "Galeri izni vermelisin.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        const uri = res.assets[0].uri;
        setAvatarUri(uri);
        setIndividualDraft((prev) => ({ ...prev, avatarUri: uri }));
      }
    } catch {
      Alert.alert("Hata", "Avatar seçilemedi.");
    }
  }, [isOwner]);

  const activeAvatarUri = useMemo(() => {
    return avatarUri ?? individualDraft.avatarUri ?? profileView?.avatarUri ?? null;
  }, [avatarUri, individualDraft.avatarUri, profileView?.avatarUri]);

  /* ------------------------------------------------------------------ */
  /* COMPLETION                                                         */
  /* ------------------------------------------------------------------ */

  const completion = useMemo(() => {
    const source = isCompanyMode
      ? companyDraft
      : individualDraft;

    let score = 0;
    const total = 5;

    if (activeAvatarUri) score++;
    if (norm(source.about)) score++;
    if (norm(source.experience)) score++;
    if (source.focusAreas.length > 0) score++;
    if (source.highlights.length > 0) score++;

    return { percent: Math.round((score / total) * 100) };
  }, [activeAvatarUri, companyDraft, individualDraft, isCompanyMode]);

  /* ------------------------------------------------------------------ */
  /* SAVE → VİTRİN                                                      */
  /* ------------------------------------------------------------------ */

  const handleSave = useCallback(async () => {
    if (!company || !isOwner || !mode) return;

    const nextAvatar = activeAvatarUri ?? null;

    try {
      if (isCompanyMode) {
        await corporateProfileDraftStorage.patch(company.id, {
          activeProfile: "company",
          avatarUri: nextAvatar,
          about: companyDraft.about,
          career: companyDraft.experience,
          focusAreas: companyDraft.focusAreas,
          highlights: companyDraft.highlights,
        });
      } else {
        /* ---------------- INDIVIDUAL PROFILE SAVE ---------------- */

        const stored = await AsyncStorage.getItem(INDIVIDUAL_STORAGE_KEY);

        const parsed = stored ? JSON.parse(stored) : {};

        const nextProfile = {
          ...parsed,
          ...individualDraft,
          avatarUri: nextAvatar,
        };

        await AsyncStorage.setItem(
          INDIVIDUAL_STORAGE_KEY,
          JSON.stringify(nextProfile)
        );

        /* draft kısmı vitrin için gerekli */

        await corporateProfileDraftStorage.patch(company.id, {
          activeProfile: "individual",
          avatarUri: nextAvatar,
          about: individualDraft.about,
          career: individualDraft.experience,
          focusAreas: individualDraft.focusAreas,
          highlights: individualDraft.highlights,
        });
      }

      Alert.alert("Profil güncellendi", "Değişiklikler vitrine yansıtıldı.");
      navigation.goBack();
    } catch {
      Alert.alert("Kaydedilemedi", "Profil güncellenirken bir hata oluştu.");
    }
  }, [
    company,
    isOwner,
    mode,
    isCompanyMode,
    activeAvatarUri,
    companyDraft,
    individualDraft,
    navigation,
  ]);

  /* ------------------------------------------------------------------ */

  const gradientColors = useMemo(
    () =>
      T.isDark
        ? (["#000000", "#1834ae"] as const)
        : (["#ffffff", "#00bfff"] as const),
    [T.isDark]
  );

  const blocked = !company || !isOwner;

  /* ------------------------------------------------------------------ */

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.backgroundColor }}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <AppGradientHeader
        title="Kurumsal Profilini Yönet"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={handleSave}
            disabled={!mode || blocked}
            style={{ padding: 8, opacity: !mode || blocked ? 0.45 : 1 }}
          >
            <Ionicons name="checkmark" size={22} color={T.isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        }
      />

      {blocked ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: T.mutedText, fontWeight: "900" }}>
            Bu alan yalnızca profil sahibine açıktır.
          </Text>
        </View>
      ) : (
        <>
          {!mode ? <CorporateIdentityChoice onSelect={setMode} /> : null}

          {mode && (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <TouchableOpacity
                onPress={pickAvatar}
                activeOpacity={0.9}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: T.border,
                  backgroundColor: T.cardBg,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeAvatarUri ? (
                  <Image
                    source={{ uri: activeAvatarUri }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Ionicons
                    name={isCompanyMode ? "business" : "person"}
                    size={34}
                    color={T.mutedText}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}

          {mode && (
            <CorporateIndividualProfileInlineForm
              mode="full"
              editing
              value={individualDraft}
              onChange={setIndividualDraft}
            />
          )}

          {mode && (
            <CorporateHomeOwnerEditor mode={mode} completion={completion} />
          )}

          {mode && (
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.9}
              style={{
                margin: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: T.border,
                padding: 14,
                alignItems: "center",
                backgroundColor: T.cardBg,
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Ionicons name="checkmark" size={18} color={T.textColor} />
              <Text style={{ color: T.textColor, fontWeight: "900" }}>
                Profili Güncelle
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}