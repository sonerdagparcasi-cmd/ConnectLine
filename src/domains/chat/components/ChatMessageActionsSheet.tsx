// src/domains/chat/components/ChatMessageActionsSheet.tsx
// ADIM 8 – Message actions: reply, forward, delete, pin, report
// UI-only, callbacks only

import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import type { UiMessage } from "../services/chatMessageFactory";

const PANEL_WIDTH_RATIO = 0.72;

export type QuickReactionEmoji =
  | "👍"
  | "❤️"
  | "😂"
  | "😮"
  | "😢"
  | "👏"
  | "🔥"
  | "🎉"
  | "🤔"
  | "👎";

export type MessageActionCallback = () => void;

type Props = {
  visible: boolean;
  message: UiMessage | null;
  onClose: () => void;

  onReply: MessageActionCallback;
  onForward: MessageActionCallback;
  onDeleteForMe: MessageActionCallback;
  onDeleteForEveryone: MessageActionCallback;
  /** Optional so existing screens keep working; when provided, Pin and Report actions are shown */
  onPinMessage?: MessageActionCallback;
  onReportMessage?: MessageActionCallback;
  onCopy?: MessageActionCallback;
  onEdit?: MessageActionCallback;
  /** Quick reactions at top: all supported emojis in one row (no picker). */
  onQuickReaction?: (emoji: QuickReactionEmoji) => void;
  /** When provided, overrides internal edit visibility (e.g. from chatService.canEditMessageForUI). */
  canEditOverride?: boolean;
  /** When true, message is already in "deleted for everyone" state; hide Delete for everyone. */
  isDeletedForEveryone?: boolean;
  /** When true, treat as system message: hide Pin, Reply, Forward (normal messages only). */
  isSystemMessage?: boolean;
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

const QUICK_EMOJIS: QuickReactionEmoji[] = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "👏",
  "🔥",
  "🎉",
  "🤔",
  "👎",
];

export default function ChatMessageActionsSheet({
  visible,
  message,
  onClose,
  onReply,
  onForward,
  onDeleteForMe,
  onDeleteForEveryone,
  onPinMessage,
  onReportMessage,
  onCopy,
  onEdit,
  onQuickReaction,
  canEditOverride,
  isDeletedForEveryone: isAlreadyRemoved,
  isSystemMessage = false,
}: Props) {
  const T = useAppTheme();

  if (!visible || !message) return null;

  const canDeleteForEveryone = message.mine && !isAlreadyRemoved;
  const canEdit = canEditOverride ?? (message.mine && !!message.text);
  const showReplyForward = !isSystemMessage;
  const showPin = onPinMessage && !isSystemMessage;
  const overlayBg = T.isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.25)";
  const panelWidth = Dimensions.get("window").width * PANEL_WIDTH_RATIO;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: overlayBg }]}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.sheetWrap}>
        <View style={[styles.sheet, { width: panelWidth }]}>
        {onQuickReaction && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickReactionsContent}
              style={styles.quickReactionsScroll}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    onQuickReaction(emoji);
                    onClose();
                  }}
                  style={styles.quickReactionBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.reactionDivider} />
          </>
        )}
        {showReplyForward && (
          <Action icon="arrow-undo-outline" label={t("chat.actions.reply")} onPress={onReply} />
        )}
        {showReplyForward && (
          <Action icon="share-outline" label={t("chat.actions.forward")} onPress={onForward} />
        )}
        {showPin && (
          <Action icon="pin-outline" label={t("chat.pinMessage")} onPress={onPinMessage} />
        )}
        {canEdit && onEdit && (
          <Action icon="create-outline" label="Düzelt" onPress={onEdit} />
        )}
        <Action
          icon="trash-outline"
          label={t("chat.actions.deleteForMe")}
          destructive
          onPress={onDeleteForMe}
        />
        {canDeleteForEveryone && (
          <Action
            icon="trash-outline"
            label={t("chat.actions.deleteForEveryone")}
            destructive
            onPress={onDeleteForEveryone}
          />
        )}
        {onCopy && <Action icon="copy-outline" label={t("chat.actions.copy")} onPress={onCopy} />}
        {onReportMessage && (
          <Action
            icon="flag-outline"
            label={t("chat.reportMessage")}
            onPress={onReportMessage}
          />
        )}
        </View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* SUB COMPONENT                                                      */
/* ------------------------------------------------------------------ */

function Action({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const textColor = destructive ? C.danger : "#ffffff";

  return (
    <TouchableOpacity onPress={onPress} style={styles.action}>
      {icon != null && (
        <Ionicons name={icon} size={16} color={textColor} style={styles.actionIcon} />
      )}
      <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: "center",
  },
  sheet: {
    backgroundColor: "#1b1a1a",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 6,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  quickReactionsScroll: {
    flexGrow: 0,
  },
  quickReactionsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickReactionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  quickReactionEmoji: {
    fontSize: 22,
  },
  reactionDivider: {
    height: 1,
    marginVertical: 6,
    backgroundColor: "#ffffff",
    opacity: 0.18,
  },
});
