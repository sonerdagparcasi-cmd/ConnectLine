import { useAppTheme } from "@/shared/theme/appTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSocialProfile } from "../hooks/useSocialProfile";
import {
  getSocialMessages,
  socialMessageService,
  sendSocialMessage,
} from "../services/socialMessageService";

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();

  const isToday =
    d.toDateString() === today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday =
    d.toDateString() === yesterday.toDateString();

  if (isToday) return "Bugün";
  if (isYesterday) return "Dün";

  return d.toLocaleDateString();
}

export default function SocialChatScreen() {
  const T = useAppTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useSocialProfile();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const otherUserId = route.params?.userId;
  const conversationId = otherUserId;

  useEffect(() => {
    if (!conversationId) return;
    socialMessageService.markAsRead(conversationId);
  }, [conversationId]);

  const [text, setText] = useState("");
  const [listVersion, setListVersion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef<FlatList>(null);
  const typingTimeout = useRef<any>(null);

  const messages = useMemo(() => {
    const list = getSocialMessages(profile.userId).filter(
      (m) =>
        m.senderId === otherUserId || m.receiverId === otherUserId
    );

    return list.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [profile.userId, otherUserId, listVersion]);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({
        animated: true,
      });
    }, 50);
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={56}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, backgroundColor: T.background }}>
          
          {/* MESSAGES */}
          <FlatList
            ref={listRef}
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
            data={messages}
            initialNumToRender={20}
            keyExtractor={(item, index) => item.id + "_" + index}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 80,
            }}
            renderItem={({ item, index }) => {
              const showDate =
                index === 0 ||
                new Date(item.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              const isMe = item.senderId === profile.userId;

              return (
                <>
                  {showDate && (
                    <View
                      style={{
                        alignItems: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: T.mutedText,
                          fontSize: 12,
                          backgroundColor: T.inputBackground,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 10,
                        }}
                      >
                        {formatDateLabel(item.createdAt)}
                      </Text>
                    </View>
                  )}
                <View
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    backgroundColor: isMe ? T.primary : T.card,
                    padding: 10,
                    borderRadius: 14,
                    marginVertical: 6,
                    maxWidth: "80%",
                  }}
                >
                  {/* STORY PREVIEW */}
                  {item.type === "story_reply" && item.storyId && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("SocialStoryViewer", {
                          storyId: item.storyId,
                        })
                      }
                      style={{
                        backgroundColor: T.inputBackground,
                        padding: 8,
                        borderRadius: 12,
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ color: T.mutedText, fontSize: 12 }}>
                        📸 Story yanıtı
                      </Text>
                    </TouchableOpacity>
                  )}

                  {item.type === "story_reply" && (
                    <Text style={{ color: T.mutedText, fontSize: 12 }}>
                      🔥 Story reaksiyonu
                    </Text>
                  )}

                  <Text style={{ color: T.textColor }}>{item.text}</Text>
                  {isMe && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: T.mutedText,
                        marginTop: 2,
                        alignSelf: "flex-end",
                      }}
                    >
                      ✔✔
                    </Text>
                  )}
                  <Text
                    style={{
                      color: T.mutedText,
                      fontSize: 11,
                      marginTop: 4,
                      alignSelf: "flex-end",
                    }}
                  >
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                </>
              );
            }}
          />

          {/* TYPING — input üstü, listeden bağımsız */}
          {isTyping && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 6,
                paddingBottom: 4,
                backgroundColor: T.background,
              }}
            >
              <Text style={{ color: T.mutedText, fontSize: 12 }}>
                💬 yazıyor...
              </Text>
            </View>
          )}

          {/* INPUT */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingTop: 6,
              paddingBottom: Math.max(insets.bottom, 38),
              backgroundColor: T.background,
              borderTopWidth: 1,
              borderTopColor: T.border,
            }}
          >
            <TextInput
              value={text}
              onChangeText={(val) => {
                setText(val);

                setIsTyping(true);

                if (typingTimeout.current) {
                  clearTimeout(typingTimeout.current);
                }

                typingTimeout.current = setTimeout(() => {
                  setIsTyping(false);
                }, 1000);
              }}
              placeholder="Mesaj yaz..."
              placeholderTextColor={T.mutedText}
              style={{
                flex: 1,
                backgroundColor: T.inputBackground,
                color: T.textColor,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontWeight: "600",
              }}
            />

            <TouchableOpacity
              onPress={() => {
                const t = text.trim();
                if (!t || !otherUserId) return;

                sendSocialMessage({
                  id: `msg_${Date.now()}`,
                  senderId: profile.userId,
                  receiverId: otherUserId,
                  text: t,
                  type: "text",
                  createdAt: new Date().toISOString(),
                });

                setText("");
                setListVersion((v) => v + 1);
              }}
              style={{
                marginLeft: 8,
                backgroundColor: T.primary,
                borderRadius: 20,
                paddingHorizontal: 16,
                height: 40,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: T.textColor, fontWeight: "700" }}>
                Gönder
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
