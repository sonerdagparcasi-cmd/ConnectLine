// src/domains/chat/components/call/CallControls.tsx
// Mute, camera, speaker, end call – chat domain only

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { t } from "../../../../shared/i18n/t";

export type CallControlsProps = {
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeakerOn: boolean;
  isVideoCall: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
};

function CallControlsInner({
  isMuted,
  isCameraOn,
  isSpeakerOn,
  isVideoCall,
  onToggleMute,
  onToggleCamera,
  onToggleSpeaker,
  onEndCall,
}: CallControlsProps) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const btnStyle = { backgroundColor: T.cardBg, borderColor: T.border };
  const activeStyle = { backgroundColor: T.accent, borderColor: T.accent };
  const endBtnStyle = { backgroundColor: C.danger };
  const onAccentText = C.buttonText;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={onToggleMute}
        style={[styles.controlBtn, btnStyle, isMuted && activeStyle]}
      >
        <Ionicons
          name={isMuted ? "mic-off" : "mic"}
          size={24}
          color={isMuted ? onAccentText : T.textColor}
        />
        <Text style={[styles.label, { color: isMuted ? onAccentText : T.textColor }]}>
          {t("chat.call.mute")}
        </Text>
      </TouchableOpacity>

      {isVideoCall && (
        <TouchableOpacity
          onPress={onToggleCamera}
          style={[styles.controlBtn, btnStyle, !isCameraOn && activeStyle]}
        >
          <Ionicons
            name={isCameraOn ? "videocam" : "videocam-off"}
            size={24}
            color={isCameraOn ? T.textColor : onAccentText}
          />
          <Text style={[styles.label, { color: isCameraOn ? T.textColor : onAccentText }]}>
            {t("chat.call.camera")}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onToggleSpeaker}
        style={[styles.controlBtn, btnStyle, isSpeakerOn && activeStyle]}
      >
        <Ionicons
          name={isSpeakerOn ? "volume-high" : "volume-mute"}
          size={24}
          color={isSpeakerOn ? onAccentText : T.textColor}
        />
        <Text style={[styles.label, { color: isSpeakerOn ? onAccentText : T.textColor }]}>
          {t("chat.call.speaker")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onEndCall}
        style={[styles.controlBtn, styles.endBtn, endBtnStyle]}
      >
        <Ionicons name="call" size={26} color={onAccentText} />
        <Text style={[styles.endLabel, { color: onAccentText }]}>{t("chat.call.end")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
  endBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 0,
  },
  endLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default memo(CallControlsInner);
