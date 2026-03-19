// src/domains/corporate/components/CorporateOwnerMenu.tsx
// 🔒 OWNER MENU – STABLE, ACCESSIBLE & THEME-SAFE
// Fix:
// - useAppTheme() → text ❌ yerine textColor ✅
// - TS2339 tamamen çözülür
// - Küçük ekran / font scaling / cihaz farkları güvenli

import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

type MenuItemProps = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function MenuItem({ label, icon, onPress }: MenuItemProps) {
  const T = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.item,
        {
          backgroundColor: T.backgroundColor,
          borderColor: T.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={T.textColor}
          style={styles.icon}
        />
      ) : null}

      <Text
        style={[
          styles.label,
          { color: T.textColor },
        ]}
        numberOfLines={1}
        allowFontScaling
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CorporateOwnerMenu({
  navigation,
  canOpenSellerManagement,
}: {
  navigation: any;
  canOpenSellerManagement: boolean;
}) {
  const T = useAppTheme();

  function go(route: string) {
    navigation.navigate(route);
  }

  return (
    <View style={[styles.container, { backgroundColor: T.cardBg }]}>
      {/* -------- PROFILE -------- */}
      <MenuItem
        label="Profili Düzenle"
        icon="create-outline"
        onPress={() => go("CorporateHome")}
      />

      <MenuItem
        label="Ayarlar"
        icon="settings-outline"
        onPress={() => go("CorporateSettings")}
      />

      <MenuItem
        label="İlanlarım"
        icon="briefcase-outline"
        onPress={() => go("CorporateJobs")}
      />

      {/* -------- SELLER MANAGEMENT -------- */}
      {canOpenSellerManagement ? (
        <View style={styles.divider}>
          <MenuItem
            label="Satıcı Yönetimi"
            icon="storefront-outline"
            onPress={() => go("StoreSeller")}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    minHeight: 48, // 🔒 touch + visibility safety
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  divider: {
    marginTop: 12,
  },
});