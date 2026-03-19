// src/domains/chat/components/ChatAudioWaveform.tsx

import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  peaks: number[];
  progress?: number; // 0–1
  activeColor: string;
  inactiveColor: string;
  onSeek?: (p: number) => void; // 🔒 ADIM 5.3
};

function ChatAudioWaveform({
  peaks,
  progress = 0,
  activeColor,
  inactiveColor,
  onSeek,
}: Props) {
  return (
    <View style={styles.row}>
      {peaks.map((v, i) => {
        const ratio = i / peaks.length;
        const isActive = ratio <= progress;

        return (
          <Pressable
            key={i}
            onPress={() => onSeek?.(ratio)}
          >
            <View
              style={[
                styles.bar,
                {
                  height: 6 + v * 20,
                  backgroundColor: isActive
                    ? activeColor
                    : inactiveColor,
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(ChatAudioWaveform);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    marginVertical: 4,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});