// src/domains/corporate/feed/components/CorporateFeedMedia.tsx
// 🔒 D2 – VIDEO UX STABİL (FEED HİZALI)

import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useMemo, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import type { CorporateMediaItem } from "../../types/feed.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  media: CorporateMediaItem[];
  onPress: (index: number) => void;
};

/**
 * 🔒 CorporateFeedMedia (D2 – FEED STANDART)
 *
 * - Dimensions YOK
 * - %100 parent width
 * - Feed / PostDetail ile birebir
 * - Autoplay yok
 * - Varsayılan sessiz
 */

export default function CorporateFeedMedia({ media, onPress }: Props) {
  const T = useAppTheme();

  const [muted, setMuted] = useState(true);
  const videoRef = useRef<Video>(null);

  const items = useMemo(
    () => [...media].sort((a, b) => a.order - b.order),
    [media]
  );

  if (!items.length) return null;

  const hero = items[0];
  const thumbs = items.slice(1, 4);
  const remaining = Math.max(0, items.length - 4);

  function toggleMute() {
    setMuted((v) => !v);
  }

  return (
    <View style={styles.wrap}>
      {/* ================= HERO ================= */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(0)}
        style={[styles.hero, { borderColor: T.border }]}
      >
        {hero.type === "image" ? (
          <Image
            source={{ uri: hero.uri }}
            style={styles.heroMedia}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroMedia}>
            <Video
              ref={videoRef}
              source={{ uri: hero.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isMuted={muted}
              useNativeControls={false}
            />

            <View style={styles.playOverlay}>
              <Ionicons
                name="play-circle"
                size={56}
                color="rgba(255,255,255,0.95)"
              />
            </View>

            <TouchableOpacity
              onPress={toggleMute}
              activeOpacity={0.8}
              style={styles.audioToggle}
            >
              <Ionicons
                name={muted ? "volume-mute" : "volume-high"}
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* ================= THUMBS ================= */}
      {thumbs.length > 0 && (
        <View style={styles.thumbRow}>
          {thumbs.map((m, idx) => {
            const realIndex = idx + 1;
            const isLast = idx === thumbs.length - 1;
            const showMore = remaining > 0 && isLast;

            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.9}
                onPress={() => onPress(realIndex)}
                style={[
                  styles.thumb,
                  { borderColor: T.border, backgroundColor: T.cardBg },
                ]}
              >
                {m.type === "image" ? (
                  <Image
                    source={{ uri: m.uri }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={StyleSheet.absoluteFill}>
                    <Video
                      source={{ uri: m.uri }}
                      style={StyleSheet.absoluteFill}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isMuted
                      useNativeControls={false}
                    />
                    <View style={styles.smallPlay}>
                      <Ionicons name="play" size={18} color="#fff" />
                    </View>
                  </View>
                )}

                {showMore && (
                  <View style={styles.moreOverlay}>
                    <Text style={styles.moreText}>{`+${remaining}`}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
  },

  hero: {
    width: "100%",
    aspectRatio: 1.6,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },

  heroMedia: {
    width: "100%",
    height: "100%",
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  audioToggle: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  thumbRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  thumb: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },

  smallPlay: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  moreText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});