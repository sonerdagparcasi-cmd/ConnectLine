import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export type CompanyProfileTab =
  | "feed"
  | "about"
  | "jobs";

type Props = {
  active: CompanyProfileTab;
  onChange: (tab: CompanyProfileTab) => void;
};

export default function CompanyProfileTabs({ active, onChange }: Props) {
  const T = useAppTheme();

  const tabs: { key: CompanyProfileTab; label: string }[] = [
    { key: "feed", label: "Paylaşımlar" },
    { key: "about", label: "Hakkında" },
    { key: "jobs", label: "İş İlanları" },
  ];

  return (
    <View style={[styles.row, { borderColor: T.border }]}>
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.item}
          >
            <Text
              style={{
                color: isActive ? T.accent : T.mutedText,
                fontWeight: isActive ? "900" : "700",
              }}
            >
              {t.label}
            </Text>
            {isActive && (
              <View
                style={[
                  styles.indicator,
                  { backgroundColor: T.accent },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  item: {
    paddingVertical: 10,
    alignItems: "center",
    flex: 1,
  },
  indicator: {
    marginTop: 6,
    height: 3,
    width: 24,
    borderRadius: 2,
  },
});