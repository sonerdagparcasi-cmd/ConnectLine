// src/domains/corporate/jobs/components/JobsFilterSortBar.tsx

import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export type JobsSort = "newest" | "oldest" | "popular";

type Props = {
  location?: string;
  skill?: string;
  sort: JobsSort;
  onPickLocation: () => void;
  onPickSkill: () => void;
  onChangeSort: (s: JobsSort) => void;
  onClear: () => void;
};

export default function JobsFilterSortBar({
  location,
  skill,
  sort,
  onPickLocation,
  onPickSkill,
  onChangeSort,
  onClear,
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
      {/* Filters */}
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Chip
          label={location ? `${t("corporate.jobs.filter.location")}: ${location}` : t("corporate.jobs.filter.location")}
          active={!!location}
          onPress={onPickLocation}
        />
        <Chip
          label={skill ? `${t("corporate.jobs.filter.skill")}: ${skill}` : t("corporate.jobs.filter.skill")}
          active={!!skill}
          onPress={onPickSkill}
        />

        {(location || skill) && (
          <TouchableOpacity
            onPress={onClear}
            style={{ paddingHorizontal: 10, height: 34, justifyContent: "center" }}
          >
            <Text style={{ color: T.accent, fontWeight: "800" }}>
              {t("corporate.jobs.filter.clear")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <SortButton
          label={t("corporate.jobs.sort.newest")}
          active={sort === "newest"}
          onPress={() => onChangeSort("newest")}
        />
        <SortButton
          label={t("corporate.jobs.sort.oldest")}
          active={sort === "oldest"}
          onPress={() => onChangeSort("oldest")}
        />
        <SortButton
          label={t("corporate.jobs.sort.popular")}
          active={sort === "popular"}
          onPress={() => onChangeSort("popular")}
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

function SortButton({
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
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: active ? T.accent : T.border,
        backgroundColor: active ? "rgba(127,127,127,0.12)" : T.cardBg,
      }}
    >
      <Ionicons
        name={active ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={active ? T.accent : T.mutedText}
      />
      <Text style={{ fontSize: 12, fontWeight: "800", color: T.textColor }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}