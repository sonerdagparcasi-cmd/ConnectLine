// src/domains/social/screens/SocialEditNameScreen.tsx
// 🔒 SOCIAL EDIT NAME SCREEN — FINAL

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
import { socialProfileStore } from "../state/socialProfileStore";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

export default function SocialEditNameScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { profile } = useSocialProfile();

  const [name, setName] = useState(profile.username);

  function saveName() {
    socialProfileStore.setName(name);
    navigation.goBack();
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <View style={styles.container}>
        <Text style={[styles.label, { color: T.mutedText }]}>
          Kullanıcı Adı
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="İsminizi yazın"
          placeholderTextColor={T.mutedText}
          style={[
            styles.input,
            { borderColor: T.border, color: T.textColor },
          ]}
        />
      </View>

      <TouchableOpacity
        onPress={saveName}
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
  },

  saveBtn: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  saveText: { color: "#fff", fontWeight: "900" },
});