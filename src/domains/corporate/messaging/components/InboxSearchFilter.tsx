// src/domains/corporate/messaging/components/InboxSearchFilter.tsx

import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export type InboxFilter = "all" | "unread" | "company" | "individual";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  filter: InboxFilter;
  onFilterChange: (f: InboxFilter) => void;
};

export default function InboxSearchFilter({
  query,
  onQueryChange,
  filter,
  onFilterChange,
}: Props) {
  const T = useAppTheme();

  return (
    <View
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: T.border,
        backgroundColor: T.backgroundColor,
      }}
    >
      {/* Search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: T.cardBg,
          borderColor: T.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 10,
          height: 44,
        }}
      >
        <Ionicons name="search-outline" size={18} color={T.mutedText} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={t("corporate.inbox.search")}
          placeholderTextColor={T.mutedText}
          style={{
            flex: 1,
            marginLeft: 8,
            color: T.textColor,
          }}
        />
        {query ? (
          <TouchableOpacity onPress={() => onQueryChange("")}>
            <Ionicons name="close-circle" size={18} color={T.mutedText} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <Chip
          label={t("corporate.inbox.filter.all")}
          active={filter === "all"}
          onPress={() => onFilterChange("all")}
        />
        <Chip
          label={t("corporate.inbox.filter.unread")}
          active={filter === "unread"}
          onPress={() => onFilterChange("unread")}
        />
        <Chip
          label={t("corporate.inbox.filter.company")}
          active={filter === "company"}
          onPress={() => onFilterChange("company")}
        />
        <Chip
          label={t("corporate.inbox.filter.individual")}
          active={filter === "individual"}
          onPress={() => onFilterChange("individual")}
        />
      </View>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const T = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        paddingHorizontal: 12,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: active ? T.accent : T.border,
        backgroundColor: active ? "rgba(127,127,127,0.12)" : T.cardBg,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "800",
          color: active ? T.textColor : T.mutedText,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}