import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import StoryRing from "./StoryRing";

export default function StoryAvatar({
  name,
  uri,
  userId,
  seen,
  active,
  isMe,
}: {
  name: string;
  uri: string | null;
  userId: string;
  seen: boolean;
  active?: boolean;
  isMe?: boolean;
}) {
  const T = useAppTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={[styles.ringWrap, active && styles.ringWrapActive]}>
        <StoryRing seen={seen}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("ChatStoryViewer", {
                currentUserId: userId,
                initialStoryIndex: 0,
              })
            }
          >
            {uri ? (
              <Image source={{ uri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={22} color={T.textColor} />
              </View>
            )}

            {isMe && (
              <TouchableOpacity
                style={styles.avatarPlus}
                onPress={() => navigation.navigate("StoryCreate")}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={13} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </StoryRing>
      </View>

      <Text
        style={[styles.name, { color: T.textColor }]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 12,
    width: 60,
  },

  ringWrap: {
    borderRadius: 18,
  },

  ringWrapActive: {
    ...Platform.select({
      ios: {
        shadowColor: "#00BFFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        shadowColor: "#00BFFF",
      },
    }),
  },

  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 14,
  },

  avatarFallback: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPlus: {
    position: "absolute",
    right: 1.5,
    bottom: 1.5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00BFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
