// src/domains/social/screens/SocialHomeScreen.tsx
// 🔒 SOCIAL PROFILE HOME — LIVE PREVIEW PROFILE EDITOR

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { useSocialProfile } from "../hooks/useSocialProfile";
import { socialProfileStore } from "../state/socialProfileStore";
import type { SocialStackParamList } from "../navigation/SocialNavigator";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

export default function SocialHomeScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const { profile, updateProfile } = useSocialProfile();

  const [avatar, setAvatar] = useState(profile.avatarUri || "");
  const [cover, setCover] = useState(profile.coverUri || "");

  const [name, setName] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [job, setJob] = useState(profile.job || "");
  const [location, setLocation] = useState(profile.location || "");
  const [education, setEducation] = useState(profile.education || "");
  const [website, setWebsite] = useState(profile.website || "");

  const profileStore = socialProfileStore.getProfile();
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    return socialProfileStore.subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  /* ------------------------------------------------ */
  /* IMAGE PICKER                                     */
  /* ------------------------------------------------ */

  async function pickImage(setter: (uri: string) => void) {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Galeri izni verilmedi");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  }

  /* ------------------------------------------------ */

  const gradientColors = T.isDark
    ? ["#000000", "#1834ae"]
    : ["#ffffff", "#00bfff"];

  /* ------------------------------------------------ */
  /* SAVE PROFILE                                     */
  /* ------------------------------------------------ */

  function saveProfile() {
    updateProfile({
      username: name,
      avatarUri: avatar,
      coverUri: cover,
      bio: bio,
      job: job,
      location: location,
      education: education,
      website: website,
    });

    Alert.alert("Profil güncellendi");

    navigation.replace("SocialProfileContainer");
  }

  /* ------------------------------------------------ */

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: T.backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      {/* COVER */}

      <TouchableOpacity onPress={() => pickImage(setCover)}>
        <View style={styles.cover}>
          {cover ? (
            <Image source={{ uri: cover }} style={styles.coverImg} />
          ) : (
            <LinearGradient
              colors={gradientColors as any}
              style={styles.coverGradient}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* AVATAR */}

      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={() => pickImage(setAvatar)}
      >
        <View style={styles.avatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={40} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      {/* LIVE PREVIEW */}

      <View style={styles.preview}>
        <Text style={[styles.previewName, { color: T.textColor }]}>
          {name || "İsim Soyisim"}
        </Text>

        <Text style={[styles.previewBio, { color: T.mutedText }]}>
          {bio || "Bio"}
        </Text>
      </View>

      {/* FORM */}

      <View style={styles.form}>
        <Field icon="👤" value={name} onChange={setName} placeholder="İsim soyisim" T={T} />

        <Field icon="📝" value={bio} onChange={setBio} placeholder="Bio" T={T} />

        <Field icon="💼" value={job} onChange={setJob} placeholder="Meslek" T={T} />

        <Field icon="📍" value={location} onChange={setLocation} placeholder="Konum" T={T} />

        <Field icon="🎓" value={education} onChange={setEducation} placeholder="Eğitim" T={T} />

        <Field icon="🌐" value={website} onChange={setWebsite} placeholder="Website" T={T} />
      </View>

      {/* PRIVACY / SECURITY (FAZ 5) */}

      <View style={[styles.privacySection, { borderTopColor: T.border }]}>
        <Text style={[styles.privacyTitle, { color: T.textColor }]}>
          {t("social.privateAccount")}
        </Text>
        <View style={[styles.privacyRow, { borderBottomColor: T.border }]}>
          <Text style={[styles.privacyLabel, { color: T.textColor }]}>
            {t("social.privateAccount")}
          </Text>
          <Switch
            value={profileStore.privateAccount}
            onValueChange={(v) => socialProfileStore.setPrivateAccount(v)}
            trackColor={{ false: T.border, true: T.accent + "99" }}
            thumbColor={profileStore.privateAccount ? T.accent : T.mutedText}
          />
        </View>
        <View style={[styles.privacyRow, { borderBottomColor: T.border }]}>
          <Text style={[styles.privacyLabel, { color: T.textColor }]}>
            {t("social.allowMessageRequests")}
          </Text>
          <Switch
            value={profileStore.allowMessageRequests}
            onValueChange={(v) => socialProfileStore.setAllowMessageRequests(v)}
            trackColor={{ false: T.border, true: T.accent + "99" }}
            thumbColor={profileStore.allowMessageRequests ? T.accent : T.mutedText}
          />
        </View>
        <View style={[styles.privacyRow, { borderBottomColor: T.border }]}>
          <Text style={[styles.privacyLabel, { color: T.textColor }]}>
            {t("social.allowStoryReplies")}
          </Text>
          <Switch
            value={profileStore.allowStoryReplies}
            onValueChange={(v) => socialProfileStore.setAllowStoryReplies(v)}
            trackColor={{ false: T.border, true: T.accent + "99" }}
            thumbColor={profileStore.allowStoryReplies ? T.accent : T.mutedText}
          />
        </View>
        <View style={[styles.privacyRow, { borderBottomColor: T.border }]}>
          <Text style={[styles.privacyLabel, { color: T.textColor }]}>
            {t("social.hideOnlineStatus")}
          </Text>
          <Switch
            value={profileStore.hideOnlineStatus}
            onValueChange={(v) => socialProfileStore.setHideOnlineStatus(v)}
            trackColor={{ false: T.border, true: T.accent + "99" }}
            thumbColor={profileStore.hideOnlineStatus ? T.accent : T.mutedText}
          />
        </View>
      </View>

      {/* SAVE */}

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: T.accent }]}
        onPress={saveProfile}
      >
        <Text style={styles.saveText}>Profili Güncelle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ------------------------------------------------ */
/* FIELD                                            */
/* ------------------------------------------------ */

function Field({ icon, value, onChange, placeholder, T }: any) {
  return (
    <View
      style={[
        styles.field,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>

      <TextInput
        style={[styles.input, { color: T.textColor }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={T.mutedText}
      />
    </View>
  );
}

/* ------------------------------------------------ */
/* STYLES                                           */
/* ------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1 },

  cover: { height: 160 },

  coverGradient: { flex: 1 },

  coverImg: {
    width: "100%",
    height: "100%",
  },

  avatarWrapper: {
    alignItems: "center",
    marginTop: -137,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#999",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
  },

  preview: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  previewName: {
    fontSize: 16,
    fontWeight: "700",
  },

  previewBio: {
    fontSize: 13,
    marginTop: 4,
  },

  form: {
    padding: 16,
    gap: 14,
  },

  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  icon: {
    fontSize: 18,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  privacySection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  privacyLabel: {
    fontSize: 14,
    flex: 1,
  },

  saveBtn: {
    margin: 40,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});