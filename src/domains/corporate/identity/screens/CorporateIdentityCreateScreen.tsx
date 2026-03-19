// src/domains/corporate/identity/screens/CorporateIdentityCreateScreen.tsx
// 🔒 CORPORATE IDENTITY CREATE – FINAL STABLE

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { corporateIdentityService } from "../services/corporateIdentityService";

import CorporateIndividualProfileInlineForm, {
  IndividualDraft,
} from "../../home/ui/CorporateIndividualProfileInlineForm";

const STORAGE_KEY = "corporate:individual_profile_v1";

const EMPTY_DRAFT: IndividualDraft = {
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

export default function CorporateIdentityCreateScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();

  const [draft, setDraft] = useState<IndividualDraft>(EMPTY_DRAFT);

  /* ------------------------------------------------ */
  /* AVATAR PICKER                                    */
  /* ------------------------------------------------ */

  const pickAvatar = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (perm.status !== "granted") {
        Alert.alert(
          "İzin gerekli",
          "Profil fotoğrafı seçmek için galeri izni vermelisin."
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setDraft((p) => ({
          ...p,
          avatarUri: res.assets[0].uri,
        }));
      }
    } catch {
      Alert.alert("Hata", "Profil fotoğrafı seçilemedi.");
    }
  }, []);

  /* ------------------------------------------------ */
  /* SAVE IDENTITY                                    */
  /* ------------------------------------------------ */

  const saveIdentity = useCallback(async () => {
    try {
      const fullName = norm(draft.fullName);

      if (!fullName) {
        Alert.alert("Eksik bilgi", "Ad soyad girmen gerekiyor.");
        return;
      }

      /* 1️⃣ Draft kaydet */

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

      /* 2️⃣ Mevcut profile al */

      const existingProfile = await corporateIdentityService.getProfile();

      let ownerUserId = existingProfile?.ownerUserId;

      if (!ownerUserId) {
        ownerUserId = `user_${Date.now()}`;
      }

      /* 3️⃣ Profile oluştur */

      await corporateIdentityService.setProfile({
        ownerUserId,
        avatarUri: draft.avatarUri ?? null,
        fullName,
        title: norm(draft.headline),
      });

      /* 4️⃣ ProfileContainer'a yönlendir */

      navigation.reset({
        index: 0,
        routes: [{ name: "CorporateProfileContainer" }],
      });
    } catch {
      Alert.alert("Hata", "Kimlik oluşturulamadı.");
    }
  }, [draft, navigation]);

  /* ------------------------------------------------ */
  /* UI                                               */
  /* ------------------------------------------------ */

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.backgroundColor }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* AVATAR */}

      <View style={{ alignItems: "center", marginTop: 24 }}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
          {draft.avatarUri ? (
            <Image
              source={{ uri: draft.avatarUri }}
              style={{
                width: 110,
                height: 110,
                borderRadius: 28,
              }}
            />
          ) : (
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 28,
                backgroundColor: T.cardBg,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Ionicons name="person" size={36} color={T.mutedText} />
            </View>
          )}

          <View
            style={{
              position: "absolute",
              bottom: -6,
              right: -6,
              backgroundColor: T.cardBg,
              borderRadius: 20,
              padding: 6,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            <Ionicons name="camera" size={16} color={T.textColor} />
          </View>
        </TouchableOpacity>

        <Text
          style={{
            marginTop: 10,
            color: T.mutedText,
            fontWeight: "700",
          }}
        >
          Profil fotoğrafı ekle
        </Text>
      </View>

      {/* FORM */}

      <CorporateIndividualProfileInlineForm
        mode="identity"
        editing
        value={draft}
        onChange={setDraft}
      />

      {/* SAVE BUTTON */}

      <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
        <TouchableOpacity
          onPress={saveIdentity}
          style={{
            backgroundColor: T.accent,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
            }}
          >
            Kurumsal kimliği oluştur
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}