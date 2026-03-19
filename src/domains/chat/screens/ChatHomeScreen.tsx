// src/domains/chat/screens/ChatHomeScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { useChatProfile } from "../profile/useChatProfile";

export default function ChatHomeScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useChatProfile();

  /* ---------------- LOCAL FORM STATE ---------------- */
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  /* 🔑 PROFILE → FORM SYNC (KİLİTLİ) */
  useEffect(() => {
    setFullName(profile.displayName || "");
    setPhone(profile.phone || "");
    setEmail(profile.email || "");
    setBio(profile.bio || "");
  }, [profile]);

  const avatarBgColors = T.isDark ? T.darkGradient.colors : T.lightGradient.colors;

  async function pickAvatar() {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("İzin gerekli", "Galeri izni vermelisin.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled) {
      updateProfile({
        avatarUri: result.assets[0].uri,
      });
    }
  }

  function onSave() {
    updateProfile({
      displayName: fullName.trim() || "Ad Soyad",
      phone,
      email,
      bio,
    });

    Alert.alert("Kaydedildi", "Profil bilgileri güncellendi.");
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <StatusBar hidden />

      <AppGradientHeader title="Sohbet" onBack={() => navigation.goBack()} />

      {/* ================= TOP ACTIONS ================= */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={{ padding: 4 }}
          onPress={() => navigation.navigate("ChatSettings")}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={T.textColor}
          />
        </TouchableOpacity>
      </View>

      {/* ================= AVATAR + GRADIENT ================= */}
      <LinearGradient
        colors={avatarBgColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.avatarBackground}
      >
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85}>
          <View style={[styles.avatar, { backgroundColor: T.cardBg }]}>
            {profile.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={46} color={T.textColor} />
            )}

            {/* ➕ sadece ikon, background YOK */}
            <View style={styles.plusIcon}>
              <Ionicons name="add" size={20} color={T.textColor} />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.nameText, { color: T.textColor }]}>
          {fullName || "Ad Soyad"}
        </Text>
      </LinearGradient>

      {/* ================= FORM ================= */}
      <View style={styles.form}>
        <Input label="Ad Soyad" value={fullName} onChange={setFullName} T={T} />
        <Input label="Telefon" value={phone} onChange={setPhone} T={T} />
        <Input label="E-Mail" value={email} onChange={setEmail} T={T} />
        <Input label="Bio" value={bio} onChange={setBio} multiline T={T} />

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: T.accent }]}
          onPress={onSave}
        >
          <Text style={[styles.saveText, { color: C.buttonText }]}>Güncelle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  value,
  onChange,
  multiline,
  T,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  T: any;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, marginBottom: 6, color: T.mutedText }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        placeholderTextColor={T.mutedText}
        style={[
          styles.input,
          {
            color: T.textColor,
            borderBottomColor: T.border,
          },
        ]}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },

  topActions: {
    position: "absolute",
    top: 14,
    right: 16,
    zIndex: 10,
  },

  avatarBackground: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  /* 🔹 SADECE + İKONU */
  plusIcon: {
    position: "absolute",
    right: -4,
    bottom: -4,
  },

  nameText: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
  },

  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  input: {
    borderBottomWidth: 1,
    paddingVertical: 6,
    fontSize: 14,
  },

  saveBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },

  saveText: {
    fontWeight: "800",
    fontSize: 14,
  },
});