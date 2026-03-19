import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  active: "feed" | "jobs" | "radar";
  onChange: (v: "feed" | "jobs" | "radar") => void;
};

export default function CorporateFeedTabs({ active, onChange }: Props) {
  const T = useAppTheme();

  const Tab = ({
    id,
    label,
  }: {
    id: "feed" | "jobs" | "radar";
    label: string;
  }) => {
    const selected = active === id;

    return (
      <TouchableOpacity
        onPress={() => onChange(id)}
        style={{
          flex: 1,
          alignItems: "center",
          paddingVertical: 12,
          borderBottomWidth: selected ? 2 : 0,
          borderBottomColor: T.accent,
        }}
      >
        <Text
          style={{
            fontWeight: "800",
            fontSize: 13,
            color: selected ? T.textColor : T.mutedText,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: T.border,
      }}
    >
      <Tab id="feed" label="Akış" />
      <Tab id="jobs" label="İş İlanları" />
      <Tab id="radar" label="Adaylar" />
    </View>
  );
}