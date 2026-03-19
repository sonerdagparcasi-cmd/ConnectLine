import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { getSocialMessages } from "../services/socialMessageService";
import { useSocialProfile } from "../hooks/useSocialProfile";
import { useNavigation } from "@react-navigation/native";
import { getUserDisplay } from "../story/services/socialStoryStateService";

export default function SocialInboxScreen() {
  const { profile } = useSocialProfile();
  const navigation = useNavigation<any>();

  const messages = getSocialMessages(profile.userId);

  console.log("ACTIVE USER:", profile.userId);
  console.log("ALL MESSAGES:", getSocialMessages(profile.userId));

  // konuşmaları grupla (basit)
  const conversations = Object.values(
    messages.reduce((acc: any, msg) => {
      const otherUser =
        msg.senderId === profile.userId
          ? msg.receiverId
          : msg.senderId;

      if (!acc[otherUser]) acc[otherUser] = msg;
      return acc;
    }, {})
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
      <FlatList
        data={conversations}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => {
          const otherUser =
            item.senderId === profile.userId
              ? item.receiverId
              : item.senderId;

          const user = getUserDisplay(otherUser);

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("SocialChat", {
                  userId: otherUser,
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: "#222",
                gap: 12,
              }}
            >
              {user.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: "#333",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff" }}>👤</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {user.username}
                </Text>

                <Text style={{ color: "#aaa", marginTop: 4 }}>
                  {item.type === "story_reply"
                    ? "📸 Story’ye yanıt"
                    : item.text}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
