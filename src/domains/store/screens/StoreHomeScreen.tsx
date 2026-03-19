// src/domains/store/screens/StoreHomeScreen.tsx
// 🔒 STORE – LANDING / QUICK ENTRY (STABLE)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreStackParamList } from "../navigation/StoreNavigator";

/**
 * 🔒 StoreHomeScreen (STABLE)
 *
 * Rolü:
 * - Store domain landing / quick entry
 * - Profil Home DEĞİL
 * - Feed / katalog DEĞİL
 *
 * Kurallar:
 * - Alt menü Store → ProfileContainer (ileride)
 * - Bu ekran opsiyonel, yönlendirme amaçlı
 * - Rol / owner kararı YOK
 */

type Nav = NativeStackNavigationProp<StoreStackParamList>;

export default function StoreHomeScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.textColor }]}>
          {t("store.home.title")}
        </Text>

        <Text style={[styles.sub, { color: T.mutedText }]}>
          {t("store.home.subtitle")}
        </Text>
      </View>

      {/* QUICK ENTRY CARD */}
      <View
        style={[
          styles.card,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: T.textColor }]}>
          {t("store.home.quickActions")}
        </Text>

        {/* ACTION ROW */}
        <View style={styles.actionsRow}>
          <ActionButton
            label={t("store.home.action.catalog")}
            icon="grid-outline"
            onPress={() => navigation.navigate("StoreCatalog")}
            T={T}
          />

          <ActionButton
            label={t("store.home.action.saved")}
            icon="bookmark-outline"
            onPress={() => navigation.navigate("StoreSaved")}
            T={T}
          />

          <ActionButton
            label={t("store.home.action.campaigns")}
            icon="pricetag-outline"
            onPress={() => navigation.navigate("StoreCampaigns")}
            T={T}
          />
        </View>

        {/* CART – FUTURE STEP */}
        <View
          style={[
            styles.disabledRow,
            { borderColor: T.border },
          ]}
        >
          <Ionicons
            name="cart-outline"
            size={18}
            color={T.mutedText}
          />

          <Text style={[styles.disabledText, { color: T.mutedText }]}>
            {t("store.home.action.cart")}
          </Text>
        </View>

        <Text style={[styles.note, { color: T.mutedText }]}>
          {t("store.home.note")}
        </Text>

        <View style={[styles.hint, { borderColor: T.border }]}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={T.mutedText}
          />

          <Text style={[styles.hintText, { color: T.mutedText }]}>
            Sepet ve satın alma akışı D adımında aktif olacaktır.
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ACTION BUTTON COMPONENT                                            */
/* ------------------------------------------------------------------ */

function ActionButton({
  label,
  icon,
  onPress,
  T,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.actionBtn,
        { borderColor: T.border },
      ]}
    >
      <Ionicons name={icon} size={18} color={T.textColor} />

      <Text
        style={[styles.actionText, { color: T.textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    gap: 6,
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
  },

  sub: {
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  actionText: {
    fontSize: 12,
    fontWeight: "900",
  },

  disabledRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.45,
  },

  disabledText: {
    fontSize: 13,
    fontWeight: "900",
  },

  note: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },

  hint: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  hintText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
});