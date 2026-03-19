// src/domains/corporate/messaging/screens/CorporateConversationScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporateTopBar from "../../components/CorporateTopBar";
import MessageBubble from "../components/MessageBubble";
import { useCorporateConversation } from "../hooks/useCorporateMessaging";

const BOTTOM_SAFE_OFFSET = 72;

type Props = {
  route: {
    params?: {
      conversationId?: string;
    };
  };
};

export default function CorporateConversationScreen({ route }: Props) {
  const T = useAppTheme();

  const conversationId = route?.params?.conversationId ?? "";

  const [title, setTitle] = useState<string>(
    t("corporate.conversation.title")
  );
  const [text, setText] = useState("");

  const listRef = useRef<FlatList<any>>(null);

  const { messages, sendMessage, refresh } =
    useCorporateConversation(conversationId);

  useEffect(() => {
    // İleride kişi / şirket adına bağlanır
    setTitle(t("corporate.conversation.title"));
  }, [conversationId]);

  function onSend() {
    const msg = text.trim();
    if (!msg) return;

    sendMessage(msg);
    setText("");

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar
        title={title}
        rightIcon="refresh"
        onRightPress={refresh}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={BOTTOM_SAFE_OFFSET}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          contentContainerStyle={{ padding: 12, paddingBottom: 18 }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Composer */}
        <View style={[styles.composerWrap, { borderColor: T.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t("corporate.conversation.placeholder")}
            placeholderTextColor={T.mutedText}
            multiline
            style={[
              styles.input,
              {
                color: T.textColor,
                backgroundColor: T.cardBg,
                borderColor: T.border,
              },
            ]}
          />

          <TouchableOpacity
            onPress={onSend}
            activeOpacity={0.88}
            style={[styles.sendBtn, { backgroundColor: T.accent }]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});