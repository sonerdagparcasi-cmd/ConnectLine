import { StyleSheet, View } from "react-native";

type Props = {
  count?: number;
  compact?: boolean;
};

export default function SocialPostSkeleton({ count = 3, compact = false }: Props) {
  const items = Array.from({ length: Math.min(5, Math.max(3, count)) }, (_, i) => i);
  return (
    <View>
      {items.map((item) => (
        <View key={`skeleton_${item}`} style={[styles.wrap, compact && styles.compactWrap]}>
          <View style={styles.headRow}>
            <View style={styles.avatar} />
            <View style={styles.headTextWrap}>
              <View style={[styles.line, styles.lineShort]} />
              <View style={[styles.line, styles.lineTiny]} />
            </View>
          </View>
          <View style={[styles.media, compact && styles.compactMedia]} />
          <View style={[styles.line, styles.lineLong]} />
          <View style={[styles.line, styles.lineMedium]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  compactWrap: {
    padding: 10,
    marginBottom: 8,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dddddd",
    marginRight: 10,
  },
  headTextWrap: {
    flex: 1,
    gap: 6,
  },
  media: {
    height: 200,
    backgroundColor: "#dddddd",
    borderRadius: 12,
    marginBottom: 10,
  },
  compactMedia: {
    height: 140,
  },
  line: {
    height: 14,
    backgroundColor: "#dddddd",
    borderRadius: 6,
    marginBottom: 6,
  },
  lineTiny: {
    width: "30%",
    height: 10,
  },
  lineShort: {
    width: "45%",
  },
  lineMedium: {
    width: "60%",
  },
  lineLong: {
    width: "85%",
  },
});
