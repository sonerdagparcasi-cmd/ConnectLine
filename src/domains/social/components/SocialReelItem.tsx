import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

import type { SocialPost } from "../types/social.types";

type Props = {
  post: SocialPost;
  isActive: boolean;
};

export default function SocialReelItem({ post, isActive }: Props) {
  const [muted, setMuted] = useState(true);

  const video = useMemo(
    () => post.media?.find((m) => m.type === "video"),
    [post.media]
  );

  if (!video) return null;

  return (
    <TouchableWithoutFeedback onPress={() => setMuted((p) => !p)}>
      <View style={styles.root}>
        <Video
          source={{ uri: video.uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive}
          isLooping
          isMuted={muted}
          useNativeControls={false}
        />

        <View style={styles.soundWrap}>
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={20}
            color="#fff"
          />
        </View>

        <View style={styles.actions}>
          <Ionicons name="heart-outline" size={28} color="#fff" />
          <Ionicons name="chatbubble-outline" size={26} color="#fff" />
          <Ionicons name="bookmark-outline" size={26} color="#fff" />
          <Ionicons name="paper-plane-outline" size={26} color="#fff" />
        </View>

        <View style={styles.captionWrap}>
          <View style={styles.userRow}>
            <View style={styles.avatarWrap}>
              {post.userAvatarUri ? (
                <Image source={{ uri: post.userAvatarUri }} style={styles.avatarImg} />
              ) : null}
            </View>
            <Text style={styles.username}>{post.username}</Text>
          </View>
          {!!post.caption && <Text style={styles.caption}>{post.caption}</Text>}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  soundWrap: {
    position: "absolute",
    bottom: 120,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  actions: {
    position: "absolute",
    right: 16,
    bottom: 200,
    alignItems: "center",
    gap: 18,
  },
  captionWrap: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ccc",
    marginRight: 10,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  username: {
    color: "#fff",
    fontWeight: "600",
  },
  caption: {
    color: "#fff",
  },
});
