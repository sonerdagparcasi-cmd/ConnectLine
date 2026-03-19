// src/domains/chat/components/composer/MediaPickerButton.tsx
// "+" button: opens the attachment sheet (slide-up panel).

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  /** Called when user taps "+" to open the attachment sheet. */
  onPress: () => void;
  disabled?: boolean;
};

function MediaPickerButtonInner({ onPress, disabled }: Props) {
  const T = useAppTheme();

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress();
  }, [disabled, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={styles.btn}
      hitSlop={8}
      activeOpacity={0.7}
    >
      <Ionicons
        name="add-circle-outline"
        size={22}
        color={disabled ? T.mutedText : T.textColor}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(MediaPickerButtonInner);
