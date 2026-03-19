import { useAppTheme } from "@/core/theme/useAppTheme";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SocialStackParamList } from "../../navigation/SocialNavigator";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

export default function SocialCreateStoryScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const [picking, setPicking] = useState(false);

  async function pickAndOpenEditor() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Galeri izni gerekli");
      return;
    }

    setPicking(true);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.85,
      });

      if (res.canceled || !res.assets[0]) return;

      const a = res.assets[0];
      const type = a.type === "video" ? "video" : "image";

      navigation.navigate("SocialStoryEditor", {
        media: {
          uri: a.uri,
          type,
          width: a.width ?? 0,
          height: a.height ?? 0,
        },
      });
    } finally {
      setPicking(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 20,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Story Oluştur
      </Text>
      <Text
        style={{
          color: colors.muted,
          fontSize: 14,
          marginBottom: 28,
          textAlign: "center",
        }}
      >
        Medya seç; tam ekran editörde yazı ekle ve paylaş.
      </Text>

      <TouchableOpacity
        onPress={pickAndOpenEditor}
        disabled={picking}
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: colors.primary,
          alignItems: "center",
          opacity: picking ? 0.6 : 1,
        }}
      >
        <Text style={{ color: colors.onPrimary, fontWeight: "700", fontSize: 16 }}>
          {picking ? "…" : "📸 Medya Seç"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
