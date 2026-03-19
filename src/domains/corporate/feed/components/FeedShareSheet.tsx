// src/domains/corporate/feed/components/FeedShareSheet.tsx
// ADIM 9 – Share payload (link / deep link)

import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type FeedSharePayload = {
  postId: string;
  companyName: string;
};

type Props = {
  visible: boolean;
  payload: FeedSharePayload | null;

  onClose: () => void;

  /**
   * Parent bu payload’ı alır
   * (clipboard / inbox / external kararını orada verir)
   */
  onCopy: (payload: FeedSharePayload) => void;
  onSendInbox: (payload: FeedSharePayload) => void;
  onExternal: (payload: FeedSharePayload) => void;
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

/**
 * 🔒 ADIM 9
 * Deep link contract (mock)
 *
 * ❗ Gerçek URL değildir
 */
export function buildCorporatePostShareLink(postId: string) {
  return `connectline://corporate/post/${postId}`;
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function FeedShareSheet({
  visible,
  payload,
  onClose,
  onCopy,
  onSendInbox,
  onExternal,
}: Props) {
  const T = useAppTheme();

  if (!payload) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: T.cardBg,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: 16,
            borderColor: T.border,
            borderWidth: 1,
          }}
        >
          <Action
            icon="copy-outline"
            label={t("corporate.feed.share.copy")}
            onPress={() => onCopy(payload)}
            T={T}
          />

          <Action
            icon="chatbubble-ellipses-outline"
            label={t("corporate.feed.share.inbox")}
            onPress={() => onSendInbox(payload)}
            T={T}
          />

          <Action
            icon="share-social-outline"
            label={t("corporate.feed.share.external")}
            onPress={() => onExternal(payload)}
            T={T}
          />
        </View>
      </TouchableOpacity>
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
  T,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  T: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
      }}
    >
      <Ionicons name={icon} size={20} color={T.textColor} />
      <Text style={{ color: T.textColor, fontWeight: "700" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}