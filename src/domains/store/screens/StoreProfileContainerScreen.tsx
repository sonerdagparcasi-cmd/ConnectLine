// src/domains/store/screens/StoreProfileContainerScreen.tsx
// 🔒 STORE PROFILE CONTAINER — STABLE / SELLER WORLD CONNECTED

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { useSellerAccess } from "../../storeSeller/hooks/useSellerAccess";

import type { CoreStackParamList } from "../../../core/navigation/CoreNavigator";
import type { StoreStackParamList } from "../navigation/StoreNavigator";

/* ------------------------------------------------------------------ */
/* NAVIGATION TYPES                                                   */
/* ------------------------------------------------------------------ */

type StoreNav = NativeStackNavigationProp<
  StoreStackParamList,
  "StoreProfileContainer"
>;

type CoreNav = NativeStackNavigationProp<CoreStackParamList>;

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function StoreProfileContainerScreen() {
  const T = useAppTheme();

  const storeNavigation = useNavigation<StoreNav>();
  const coreNavigation = useNavigation<CoreNav>();

  const { hasStore, canAccessSellerPanel } = useSellerAccess();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /* AVATAR PICKER                                                     */
  /* ------------------------------------------------------------------ */

  const pickAvatar = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "İzin gerekli",
          "Profil fotoğrafı seçebilmek için galeri izni gerekli."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;

      if (uri) setAvatarUri(uri);
    } catch {
      Alert.alert("Hata", "Profil fotoğrafı seçilemedi.");
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* CUSTOMER ACTIONS                                                  */
  /* ------------------------------------------------------------------ */

  const actions = useMemo(
    () => [
      {
        key: "browse",
        title: "Alışverişe Başla",
        icon: "search-outline" as const,
        onPress: () => storeNavigation.navigate("StoreCatalog"),
      },
      {
        key: "saved",
        title: "Kaydedilenler",
        icon: "bookmark-outline" as const,
        onPress: () => storeNavigation.navigate("StoreSaved"),
      },
      {
        key: "orders",
        title: "Siparişlerim",
        icon: "receipt-outline" as const,
        onPress: () => storeNavigation.navigate("StoreOrders"),
      },
      {
        key: "cart",
        title: "Sepet",
        icon: "cart-outline" as const,
        onPress: () => storeNavigation.navigate("StoreCart"),
      },
      {
        key: "campaigns",
        title: "Kampanyalar",
        icon: "pricetag-outline" as const,
        onPress: () => storeNavigation.navigate("StoreCampaigns"),
      },
    ],
    [storeNavigation]
  );

  /* ------------------------------------------------------------------ */
  /* SELLER TOOLS                                                      */
  /* ------------------------------------------------------------------ */

  const ownerTools = useMemo(
    () => [
      {
        key: "dashboard",
        title: "Satıcı Paneli",
        icon: "grid-outline" as const,
        onPress: () => coreNavigation.navigate("StoreSeller"),
      },
    ],
    [coreNavigation]
  );

  /* ------------------------------------------------------------------ */
  /* RENDER                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 18 }}
      >
        {/* PROFILE HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={pickAvatar}
            style={[
              styles.avatarWrap,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <Ionicons
                name="storefront-outline"
                size={30}
                color={T.textColor}
              />
            )}
          </TouchableOpacity>

          <Text style={[styles.title, { color: T.textColor }]}>
            Mağaza Profili
          </Text>

          <Text style={{ color: T.mutedText, fontWeight: "700" }}>
            {hasStore ? "Satıcı hesabı" : "Müşteri hesabı"}
          </Text>
        </View>

        {/* SELLER PANEL */}

        {canAccessSellerPanel && (
          <View style={[styles.section, { borderColor: T.border }]}>
            <Text style={[styles.sectionTitle, { color: T.textColor }]}>
              Satıcı Araçları
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              {ownerTools.map((tool) => (
                <RowButton
                  key={tool.key}
                  title={tool.title}
                  icon={tool.icon}
                  onPress={tool.onPress}
                />
              ))}
            </View>
          </View>
        )}

        {/* CUSTOMER ACTIONS */}

        <View style={[styles.section, { borderColor: T.border }]}>
          <Text style={[styles.sectionTitle, { color: T.textColor }]}>
            Kısayollar
          </Text>

          <View style={styles.grid}>
            {actions.map((a) => (
              <TouchableOpacity
                key={a.key}
                onPress={a.onPress}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  { backgroundColor: T.cardBg, borderColor: T.border },
                ]}
              >
                <Ionicons name={a.icon} size={18} color={T.textColor} />

                <Text
                  style={{
                    color: T.textColor,
                    fontWeight: "900",
                    marginTop: 8,
                  }}
                >
                  {a.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  /* ------------------------------------------------------------------ */
  /* ROW BUTTON                                                        */
  /* ------------------------------------------------------------------ */

  function RowButton({
    title,
    icon,
    onPress,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.rowBtn,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <Ionicons name={icon} size={18} color={T.textColor} />

        <Text style={{ flex: 1, color: T.textColor, fontWeight: "900" }}>
          {title}
        </Text>

        <Ionicons name="chevron-forward" size={16} color={T.mutedText} />
      </TouchableOpacity>
    );
  }
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: "center",
    gap: 6,
  },

  avatarWrap: {
    width: 86,
    height: 86,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImg: { width: "100%", height: "100%" },

  title: { fontSize: 20, fontWeight: "900", marginTop: 6 },

  section: {
    marginTop: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },

  sectionTitle: { fontSize: 14, fontWeight: "900" },

  rowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },

  grid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  card: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
});