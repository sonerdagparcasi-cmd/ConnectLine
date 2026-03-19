// src/domains/chat/hooks/useChatForward.ts

import * as Haptics from "expo-haptics";
import { Alert } from "react-native";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type ForwardMeta = {
  fromLabel: string;
};

type BaseMessage = {
  text?: string;
  audio?: any;
  media?: any;
};

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatForward() {
  function forwardMessage<T extends BaseMessage>(
    target: T,
    append: (msg: T & { forwarded: ForwardMeta }) => void
  ) {
    const recipients = ["Ahmet", "Ayşe", "Mehmet", "Grup: Proje"];

    Alert.alert(
      "İlet",
      "Kime iletmek istiyorsun? (UI-only)",
      [
        ...recipients.map((r) => ({
          text: r,
          onPress: () => {
            append({
              ...target,
              forwarded: { fromLabel: "İletildi" },
            });
            Haptics.selectionAsync().catch(() => {});
          },
        })),
        { text: "Vazgeç", style: "cancel" },
      ],
      { cancelable: true }
    );
  }

  return { forwardMessage };
}
