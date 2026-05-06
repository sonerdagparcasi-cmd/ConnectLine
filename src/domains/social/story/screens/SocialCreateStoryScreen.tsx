import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
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
  const [loading, setLoading] = useState(false);

  async function openEditorWithCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Kamera izni olmadan devam edemezsiniz.");
      return;
    }

    setLoading(true);
    try {
      const res = await ImagePicker.launchCameraAsync({
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
      setLoading(false);
    }
  }

  async function openEditorWithGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Galeri izni olmadan devam edemezsiniz.");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        activeOpacity={0.85}
      >
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <View style={styles.buttonsWrap}>
        <TouchableOpacity
          onPress={openEditorWithCamera}
          disabled={loading}
          style={[styles.actionButton, loading && styles.actionButtonDisabled]}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>📷 Kamera ile Cek</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openEditorWithGallery}
          disabled={loading}
          style={[styles.actionButton, loading && styles.actionButtonDisabled]}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>🖼️ Galeriden Sec</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonsWrap: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  actionButton: {
    backgroundColor: "#00BFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
