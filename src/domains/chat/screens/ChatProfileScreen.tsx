// src/domains/chat/screens/ChatProfileScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { useChatProfile } from "../profile/useChatProfile";

export default function ChatProfileScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const { profile } = useChatProfile();

  const avatarBgColors = T.isDark ? T.darkGradient.colors : T.lightGradient.colors;

  const phone = profile.phone;
  const email = profile.email;
  const bio = profile.bio;

  /* ---------------- CALL ---------------- */

  async function onCall() {
    if (!phone) {
      Alert.alert("Telefon numarası yok");
      return;
    }
    await Linking.openURL(`tel:${phone}`);
  }

  /* ---------------- VIDEO ---------------- */

  async function onVideoCall() {
    if (!phone) {
      Alert.alert("Telefon numarası yok");
      return;
    }

    // iOS → FaceTime, Android → uygun video uygulaması
    await Linking.openURL(`facetime:${phone}`);
  }

  /* ---------------- SHARE ---------------- */

  async function onShare() {
    const parts: string[] = [];
    if (phone) parts.push(`Telefon: ${phone}`);
    if (email) parts.push(`E-Mail: ${email}`);

    const message = parts.join("\n");
    if (!message && !profile.avatarUri) return;

    if (profile.avatarUri && (await Sharing.isAvailableAsync())) {
      await Share.share({
        message,
        url: profile.avatarUri,
      });
      return;
    }

    await Share.share({ message });
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <StatusBar hidden />

      <AppGradientHeader title="Profil" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= AVATAR + GRADIENT ================= */}
        <LinearGradient
          colors={avatarBgColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.avatarBackground}
        >
          <View style={[styles.avatar, { backgroundColor: T.cardBg }]}>
            {profile.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={48} color={T.textColor} />
            )}
          </View>

          <Text style={[styles.nameText, { color: T.textColor }]}>
            {profile.displayName || "Ad Soyad"}
          </Text>

          {/* ================= ACTIONS ================= */}
          <View style={styles.actions}>
            <ActionButton
              icon="call-outline"
              label="Ara"
              onPress={onCall}
              T={T}
            />
            <ActionButton
              icon="videocam-outline"
              label="Video"
              onPress={onVideoCall}
              T={T}
            />
            <ActionButton
              icon="share-social-outline"
              label={t("chat.share")}
              onPress={onShare}
              T={T}
            />
          </View>
        </LinearGradient>

        {/* ================= INFO (READ ONLY) ================= */}
        <View style={styles.infoSection}>
          <InfoRow label="Telefon" value={phone || "—"} T={T} />
          <Divider T={T} />

          <InfoRow label="E-Mail" value={email || "—"} T={T} />
          <Divider T={T} />

          <InfoRow
            label="Bio"
            value={bio || "Henüz bir bio eklenmemiş."}
            multiline
            T={T}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= HELPERS ================= */

function ActionButton({
  icon,
  label,
  onPress,
  T,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  T: any;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={22} color={T.textColor} />
      <Text style={[styles.actionText, { color: T.textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({
  label,
  value,
  multiline,
  T,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  T: any;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: T.mutedText }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          { color: T.textColor },
          multiline && { lineHeight: 20 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider({ T }: { T: any }) {
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: T.border },
      ]}
    />
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

  scrollContent: {
    paddingBottom: 40,
  },

  avatarBackground: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },

  nameText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    gap: 28,
    marginTop: 18,
  },

  actionBtn: {
    alignItems: "center",
    gap: 6,
  },

  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },

  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  row: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },

  divider: {
    height: 1,
    opacity: 0.35,
    marginBottom: 16,
  },
});