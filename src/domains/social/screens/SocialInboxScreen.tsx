import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Button } from "react-native";
import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { socialMessageService } from "../services/socialMessageService";
import { useSocialProfile } from "../hooks/useSocialProfile";
import { useNavigation } from "@react-navigation/native";
import { getUserDisplay } from "../story/services/socialStoryStateService";
import {
  acceptEventInvite,
  declineEventInvite,
  getMyEventInvites,
} from "../services/socialEventService";

export default function SocialInboxScreen() {
  const { profile } = useSocialProfile();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const [list, setList] = useState(() => socialMessageService.getConversations());
  const currentUserId = profile.userId;
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setList([...socialMessageService.getConversations()]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setInvites(getMyEventInvites(currentUserId));
  }, [currentUserId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>
          {t("messages")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            socialMessageService.markAllAsRead();
            setList([...socialMessageService.getConversations()]);
          }}
        >
          <Text style={{ color: "#1DA1F2", fontWeight: "600" }}>
            {t("mark_all_read")}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={list}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => {
          const otherUser = item.userId ?? profile.userId;

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
                  <Text style={{ color: colors.text }}>👤</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  {user.username}
                </Text>

                <Text style={{ color: "#aaa", marginTop: 4 }} numberOfLines={1}>
                  {item.lastMessage?.text ?? ""}
                </Text>
              </View>

              {item.unreadCount > 0 && (
                <View
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#FF3B30", // iOS kırmızı
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {item.unreadCount > 9 ? "9+" : item.unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "bold", color: colors.text }}>Etkinlik Davetleri</Text>

        {invites.map((invite) => (
          <View
            key={invite.id}
            style={{
              padding: 12,
              marginTop: 10,
              backgroundColor: "#111",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", marginBottom: 8 }}>Etkinliğe davet edildin</Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title="Kabul"
                onPress={() => {
                  acceptEventInvite(invite.id);
                  setInvites(getMyEventInvites(currentUserId));
                }}
              />

              <Button
                title="Reddet"
                onPress={() => {
                  declineEventInvite(invite.id);
                  setInvites(getMyEventInvites(currentUserId));
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
