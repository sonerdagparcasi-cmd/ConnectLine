import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import SocialStoryRing from "./SocialStoryRing";

type Props = {
  avatarUri?: string | null;
  name?: string;
  seen?: boolean;
  isMe?: boolean;
  focused?: boolean;
  labelForMe?: string;
};

export default function SocialStoryAvatar({
  avatarUri,
  name,
  seen,
  isMe,
  focused,
  labelForMe,
}: Props) {
  const T = useAppTheme();

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <SocialStoryRing seen={seen}>
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: T.cardBg }]}>
              <Ionicons name="person" size={20} color={T.textColor} />
            </View>
          )}

          {isMe && (
            <View style={styles.avatarPlus}>
              <Ionicons name="add" size={14} color="#fff" />
            </View>
          )}
        </View>
      </SocialStoryRing>

      <Text style={[styles.name, { color: T.textColor }]} numberOfLines={1}>
        {isMe ? labelForMe ?? "Me" : name ?? "User"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    marginRight: 12,
    alignItems: "center",
  },

  containerFocused: {
    transform: [{ scale: 1.05 }],
  },

  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 14,
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    resizeMode: "cover",
  },

  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPlus: {
    position: "absolute",
    right: 2,
    bottom: 1,
    width: 18,
    height: 18,
    borderRadius: 8,
    backgroundColor: "#00BFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 15,
  },
});

