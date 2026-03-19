// src/domains/social/screens/SocialEditAvatarScreen.tsx
// 🔒 SOCIAL EDIT AVATAR SCREEN — FINAL

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { useSocialProfile } from "../hooks/useSocialProfile";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import { socialProfileStore } from "../state/socialProfileStore";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

export default function SocialEditAvatarScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { profile } = useSocialProfile();

  const [avatarUri, setAvatarUri] = useState<string | null>(
    profile.avatarUri ?? null
  );

  async function pickImage() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Galeri erişimi olmadan avatar değiştirilemez.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.length) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  function saveAvatar() {
    socialProfileStore.setAvatar(avatarUri);
    navigation.goBack();
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <View style={styles.center}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={pickImage}
          style={[
            styles.avatar,
            { borderColor: T.border, backgroundColor: T.cardBg },
          ]}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.img} />
          ) : (
            <Ionicons name="person" size={40} color={T.textColor} />
          )}
        </TouchableOpacity>

        <Text style={{ color: T.mutedText, marginTop: 12 }}>
          Avatar değiştirmek için dokun
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={saveAvatar}
        style={[styles.saveBtn, { backgroundColor: T.accent }]}
      >
        <Text style={styles.saveText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "space-between" },

  center: { alignItems: "center", marginTop: 80 },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  img: { width: "100%", height: "100%" },

  saveBtn: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  saveText: { color: "#fff", fontWeight: "900" },
});