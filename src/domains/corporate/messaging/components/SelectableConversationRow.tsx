import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { CorporateConversation } from "../types/messaging.types";
import ConversationRow from "./ConversationRow";

type Props = {
  item: CorporateConversation;
  selected: boolean;
  selectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

export default function SelectableConversationRow({
  item,
  selected,
  selectionMode,
  onPress,
  onLongPress,
}: Props) {
  const T = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      <View>
        {/* Ana satır */}
        <ConversationRow item={item} onPress={() => {}} />

        {/* Selection indicator */}
        {selectionMode ? (
          <View
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              marginTop: -12,
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: selected ? T.accent : T.border,
              backgroundColor: selected ? T.accent : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected ? (
              <Ionicons name="checkmark" size={14} color="#fff" />
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}