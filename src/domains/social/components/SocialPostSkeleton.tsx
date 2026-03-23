import { StyleSheet, View } from "react-native";

export default function SocialPostSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.media} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  media: {
    height: 200,
    backgroundColor: "#dddddd",
    borderRadius: 12,
    marginBottom: 10,
  },
  line: {
    height: 14,
    backgroundColor: "#dddddd",
    borderRadius: 6,
    width: "60%",
  },
});
