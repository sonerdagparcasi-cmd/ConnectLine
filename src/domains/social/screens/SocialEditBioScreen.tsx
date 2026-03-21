// src/domains/social/screens/SocialEditBioScreen.tsx
// 🔒 SOCIAL EDIT BIO SCREEN — FINAL

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { useSocialProfile } from "../hooks/useSocialProfile";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import { updateProfile } from "../state/socialProfileStore";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

const MAX_LEN = 160;

export default function SocialEditBioScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { profile } = useSocialProfile();

  const [bio, setBio] = useState(profile.bio);

  function saveBio() {
    updateProfile({
      bio,
    });
    navigation.goBack();
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <View style={styles.container}>
        <Text style={[styles.label, { color: T.mutedText }]}>Bio</Text>

        <TextInput
          value={bio}
          onChangeText={(t) => t.length <= MAX_LEN && setBio(t)}
          multiline
          placeholder="Kendiniz hakkında kısa bir açıklama yazın"
          placeholderTextColor={T.mutedText}
          style={[
            styles.input,
            { borderColor: T.border, color: T.textColor },
          ]}
        />

        <Text style={{ color: T.mutedText, marginTop: 6 }}>
          {bio.length}/{MAX_LEN}
        </Text>
      </View>

      <TouchableOpacity
        onPress={saveBio}
        style={[styles.saveBtn, { backgroundColor: T.accent }]}
      >
        <Text style={styles.saveText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "space-between" },

  container: { padding: 16, marginTop: 60 },

  label: { fontWeight: "900", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
  },

  saveBtn: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  saveText: { color: "#fff", fontWeight: "900" },
});