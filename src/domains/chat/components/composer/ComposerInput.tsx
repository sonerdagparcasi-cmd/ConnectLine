// src/domains/chat/components/composer/ComposerInput.tsx

import React, { memo, useState } from "react";
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

const MIN_HEIGHT = 44;
const MAX_HEIGHT = 120;

type Props = TextInputProps & {
  containerStyle?: object;
};

function ComposerInputInner(
  { containerStyle, style, placeholderTextColor, ...rest }: Props,
  ref: React.Ref<TextInput>
) {
  const T = useAppTheme();
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);

  function handleContentSizeChange(
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) {
    const h = e.nativeEvent.contentSize.height;
    const clamped = Math.max(MIN_HEIGHT, Math.min(h, MAX_HEIGHT));
    setInputHeight(clamped);
  }

  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor ?? T.mutedText}
        style={[
          styles.input,
          {
            color: T.textColor,
            minHeight: MIN_HEIGHT,
            maxHeight: MAX_HEIGHT,
            height: inputHeight,
          },
          style,
        ]}
        multiline
        textAlignVertical={Platform.OS === "android" ? "center" : "top"}
        maxLength={4096}
        {...rest}
        onContentSizeChange={(e) => {
          rest.onContentSizeChange?.(e);
          handleContentSizeChange(e);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 22,
    marginHorizontal: 4,
    paddingHorizontal: 2,
    paddingVertical: 6,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  },
});

export default memo(React.forwardRef(ComposerInputInner));
