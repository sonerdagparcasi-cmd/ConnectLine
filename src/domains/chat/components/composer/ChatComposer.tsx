// src/domains/chat/components/composer/ChatComposer.tsx

import { Ionicons } from "@expo/vector-icons";
import { memo, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { CHAT_SPACING } from "../../config/chatSpacing";
import type { AttachmentType, ComposerSelectPayload } from "./ChatAttachmentSheet";
import ChatAttachmentSheet from "./ChatAttachmentSheet";
import ComposerInput from "./ComposerInput";
import MediaPickerButton from "./MediaPickerButton";
import SendButton from "./SendButton";
import VoiceRecorderButton from "./VoiceRecorderButton";

export type ComposerAttachmentType = "image" | "video" | "file" | "location" | "contact";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onAttachMedia: (asset?: { uri: string; type?: string | null } | ComposerSelectPayload, type?: AttachmentType) => void;
  onStartVoiceRecording: () => void;
  onStopVoiceRecording: (cancel: boolean, durationSec?: number) => void;
  placeholder?: string;
  editPlaceholder?: string;
  replyPlaceholder?: string;
  isEditing?: boolean;
  isReply?: boolean;
  disabled?: boolean;
  /** Emoji button placeholder – no action yet */
  onEmojiPress?: () => void;
};

function ChatComposerInner({
  value,
  onChangeText,
  onSend,
  onAttachMedia,
  onStartVoiceRecording,
  onStopVoiceRecording,
  placeholder,
  editPlaceholder,
  replyPlaceholder,
  isEditing,
  isReply,
  disabled,
  onEmojiPress,
}: Props) {
  const T = useAppTheme();
  const inputRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [attachmentVisible, setAttachmentVisible] = useState(false);

  const place =
    (isEditing && editPlaceholder) ||
    (isReply && replyPlaceholder) ||
    placeholder ||
    t("chat.conversation.placeholder");

  const canSend = value.trim().length > 0;
  const showSend = canSend || isEditing;

  return (
    <View style={styles.wrap}>
      {isRecording && (
        <View style={styles.recordingSection}>
          <VoiceRecorderButton
            isRecording
            onStartRecording={onStartVoiceRecording}
            onStopRecording={onStopVoiceRecording}
            onRecordingChange={setIsRecording}
            disabled={disabled}
          />
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: T.isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
            borderColor: T.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
          },
        ]}
      >
      <View style={styles.inputRow}>
        {!isRecording && (
          <>
            <MediaPickerButton
              onPress={() => setAttachmentVisible(true)}
              disabled={disabled}
            />
            {onEmojiPress ? (
              <TouchableOpacity onPress={onEmojiPress} style={styles.emojiBtn} hitSlop={8}>
                <Ionicons name="happy-outline" size={20} color={T.textColor} />
              </TouchableOpacity>
            ) : (
              <View style={styles.emojiBtn} />
            )}
            <View style={styles.inputWrap}>
              <ComposerInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                placeholder={place}
                editable={!disabled}
              />
            </View>
          </>
        )}
        <View style={styles.right}>
          {isRecording ? (
            <View style={styles.recordingSpacer} />
          ) : showSend ? (
            <SendButton
              onPress={onSend}
              disabled={!canSend && !isEditing}
              submitEdit={!!isEditing}
            />
          ) : (
            <VoiceRecorderButton
              onStartRecording={onStartVoiceRecording}
              onStopRecording={onStopVoiceRecording}
              onRecordingChange={setIsRecording}
              disabled={disabled}
            />
          )}
        </View>
      </View>
      </View>

      <ChatAttachmentSheet
        visible={attachmentVisible}
        onClose={() => setAttachmentVisible(false)}
        onSelect={(type, payload) => {
          setAttachmentVisible(false);
          if (payload && (payload as { uri?: string }).uri) {
            const p = payload as { uri: string; kind?: string };
            onAttachMedia({
              uri: p.uri,
              type: p.kind || "image",
            });
          } else if (payload != null && type != null) {
            onAttachMedia(payload, type);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "column",
  },
  inputContainer: {
    borderRadius: 22,
    marginHorizontal: CHAT_SPACING.screenEdge,
    paddingVertical: CHAT_SPACING.composerPaddingVertical,
    paddingHorizontal: CHAT_SPACING.composerPaddingHorizontal,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: -2,
  },
  recordingSection: {
    width: "100%",
  },
  recordingSpacer: {
    width: 34,
    height: 44,
  },
  emojiBtn: {
    width: 40,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
  },
  right: {
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 44,
  },
  rightExpanded: {
    flex: 1,
  },
});

export default memo(ChatComposerInner);
