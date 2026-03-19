import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { storeMusicService } from "../services/storeMusicService";

export default function StoreMusicMiniPlayer() {
  const T = useAppTheme();
  const tracks = storeMusicService.getTracks();

  const [active, setActive] = useState<"trackA" | "trackB" | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    return () => {
      // F-62 cleanup
      storeMusicService.stopAndUnload();
    };
  }, []);

  async function play(id: "trackA" | "trackB") {
    setActive(id);
    await storeMusicService.play(id);
  }

  async function toggleMute() {
    const m = await storeMusicService.toggleMute();
    setMuted(m);
  }

  return (
    <View style={[styles.box, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <Text style={[styles.title, { color: T.textColor }]}>Katalog Müziği</Text>

      <View style={styles.row}>
        {tracks.map((t) => (
          <TouchableOpacity
            key={t.id}
            activeOpacity={0.9}
            onPress={() => play(t.id)}
            style={[
              styles.btn,
              {
                borderColor: T.border,
                backgroundColor: active === t.id ? T.accent : "transparent",
              },
            ]}
          >
            <Text
              style={{
                color: active === t.id ? "#fff" : T.textColor,
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              {t.title}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleMute}
          style={[styles.muteBtn, { borderColor: T.border }]}
        >
          <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 12 }}>
            {muted ? "Ses Kapalı" : "Sessiz"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  title: { fontSize: 13, fontWeight: "900" },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  muteBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});