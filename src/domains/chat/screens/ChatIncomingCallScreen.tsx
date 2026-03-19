// src/domains/chat/screens/ChatIncomingCallScreen.tsx
// Incoming call – caller avatar, name, accept, decline, slide animation

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import { chatCallService } from "../services/chatCallService";

type Params = { callId: string };

export default function ChatIncomingCallScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { callId } = (route.params ?? {}) as Params;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const call = chatCallService.getIncomingCall();
  const displayName = call
    ? call.participants.find((p) => p.userId !== "me")?.displayName ??
      call.callerId ??
      "—"
    : "—";
  const isVideo = call?.type === "video";

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleAccept = () => {
    if (callId) chatCallService.acceptCall(callId);
    navigation.replace("ChatCall", { callId });
  };

  const handleDecline = () => {
    if (callId) chatCallService.rejectCall(callId, true);
    navigation.goBack();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });
  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.avatarWrap,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons
            name={isVideo ? "videocam" : "call"}
            size={64}
            color={T.textColor}
          />
        </Animated.View>
        <Text style={[styles.callerName, { color: T.textColor }]}>
          {displayName}
        </Text>
        <Text style={[styles.incomingLabel, { color: T.mutedText }]}>
          {t("chat.call.incoming")} · {isVideo ? t("chat.call.video") : t("chat.call.audio")}
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={handleDecline}
            style={[styles.declineBtn, { borderColor: C.danger }]}
          >
            <Ionicons name="close" size={28} color={C.danger} />
            <Text style={[styles.declineLabel, { color: C.danger }]}>{t("chat.call.decline")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAccept}
            style={[styles.acceptBtn, { backgroundColor: T.accent }]}
          >
            <Ionicons name="call" size={26} color={C.buttonText} />
            <Text style={[styles.acceptLabel, { color: C.buttonText }]}>{t("chat.call.accept")}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
  },
  avatarWrap: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  callerName: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 24,
  },
  incomingLabel: {
    fontSize: 15,
    marginTop: 8,
  },
  buttons: {
    flexDirection: "row",
    gap: 32,
    marginTop: 48,
  },
  declineBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  declineLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  acceptBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  acceptLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
