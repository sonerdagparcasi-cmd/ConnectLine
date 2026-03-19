// src/domains/chat/components/composer/SendButton.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  /** Show checkmark for "submit edit" state */
  submitEdit?: boolean;
};

function SendButtonInner({ onPress, disabled, submitEdit }: Props) {
  const T = useAppTheme();
  const color = disabled ? T.mutedText : T.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.btn}
      hitSlop={8}
      activeOpacity={0.7}
    >
      <Ionicons
        name={submitEdit ? "checkmark" : "send"}
        size={22}
        color={color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(SendButtonInner);
