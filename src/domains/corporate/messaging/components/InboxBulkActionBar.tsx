// src/domains/corporate/messaging/components/InboxBulkActionBar.tsx

import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  selectedCount: number;
  onClear: () => void;
  onMarkRead: () => void;
  onArchive: () => void;
};

export default function InboxBulkActionBar({
  selectedCount,
  onClear,
  onMarkRead,
  onArchive,
}: Props) {
  const T = useAppTheme();

  if (selectedCount === 0) return null;

  return (
    <View
      style={{
        height: 52,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: T.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: T.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TouchableOpacity onPress={onClear} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={T.textColor} />
        </TouchableOpacity>
        <Text style={{ color: T.textColor, fontWeight: "900" }}>
          {selectedCount} {t("corporate.inbox.selected")}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 14 }}>
        <TouchableOpacity onPress={onMarkRead} activeOpacity={0.8}>
          <Ionicons name="mail-open-outline" size={20} color={T.textColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onArchive} activeOpacity={0.8}>
          <Ionicons name="archive-outline" size={20} color={T.textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}