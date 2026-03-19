import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type {
  CampaignSort,
  CampaignStatusFilter,
} from "../services/storeCampaignFilters";

type Props = {
  status: CampaignStatusFilter;
  sort: CampaignSort;
  onChangeStatus: (v: CampaignStatusFilter) => void;
  onChangeSort: (v: CampaignSort) => void;
};

export default function CampaignFilterBar({
  status,
  sort,
  onChangeStatus,
  onChangeSort,
}: Props) {
  const T = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pill label="Tümü" active={status === "all"} onPress={() => onChangeStatus("all")} />
        <Pill label="Aktif" active={status === "active"} onPress={() => onChangeStatus("active")} />
        <Pill label="Yakında" active={status === "upcoming"} onPress={() => onChangeStatus("upcoming")} />
        <Pill label="Bitti" active={status === "ended"} onPress={() => onChangeStatus("ended")} />
      </View>

      <View style={styles.row}>
        <Pill
          label="İndirim ↓"
          active={sort === "discount_desc"}
          onPress={() => onChangeSort("discount_desc")}
        />
        <Pill
          label="İndirim ↑"
          active={sort === "discount_asc"}
          onPress={() => onChangeSort("discount_asc")}
        />
        <Pill
          label="Yakında Biten"
          active={sort === "ending_soon"}
          onPress={() => onChangeSort("ending_soon")}
        />
        <Pill
          label="Yeni"
          active={sort === "newest"}
          onPress={() => onChangeSort("newest")}
        />
      </View>
    </View>
  );

  function Pill(props: { label: string; active: boolean; onPress: () => void }) {
    return (
      <TouchableOpacity
        onPress={props.onPress}
        activeOpacity={0.9}
        style={[
          styles.pill,
          {
            borderColor: T.border,
            backgroundColor: props.active ? T.cardBg : "transparent",
          },
        ]}
      >
        <Text
          style={{
            color: props.active ? T.textColor : T.mutedText,
            fontSize: 12,
            fontWeight: "900",
          }}
        >
          {props.label}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
