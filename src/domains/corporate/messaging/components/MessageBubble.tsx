// src/domains/corporate/messaging/components/MessageBubble.tsx

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { CorporateMessage } from "../types/messaging.types";

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function timeLabel(ts?: number | string) {
  if (!ts) return "";
  const d = typeof ts === "number" ? new Date(ts) : new Date(String(ts));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function MessageBubble({
  msg,
}: {
  msg: CorporateMessage;
}) {
  const T = useAppTheme();

  const isMine = msg.sender === "company";
  const isSystem = msg.type === "system";

  /* ----------------------------- */
  /* SYSTEM MESSAGE                */
  /* ----------------------------- */

  if (isSystem) {
    return (
      <View style={styles.systemWrap}>
        <View
          style={[
            styles.system,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
            },
          ]}
        >
          <Text
            style={{
              color: T.mutedText,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {msg.text ?? "—"}
          </Text>
        </View>
      </View>
    );
  }

  /* ----------------------------- */
  /* NORMAL MESSAGE                */
  /* ----------------------------- */

  const textColor = isMine ? "#fff" : T.textColor;

  return (
    <View
      style={[
        styles.wrap,
        { alignSelf: isMine ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isMine ? T.accent : T.cardBg,
            borderColor: T.border,
          },
        ]}
      >
        {msg.type === "file" ? (
          <Text style={{ color: textColor, fontWeight: "800" }}>
            📎 {msg.fileName ?? "Dosya"}
          </Text>
        ) : (
          <Text style={{ color: textColor }}>
            {msg.text ?? ""}
          </Text>
        )}

        <Text
          style={[
            styles.time,
            {
              color: isMine
                ? "rgba(255,255,255,0.75)"
                : T.mutedText,
            },
          ]}
        >
          {timeLabel(msg.createdAt)}
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  wrap: {
    maxWidth: "78%",
    marginBottom: 8,
  },
  bubble: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    gap: 6,
  },
  time: {
    fontSize: 11,
    alignSelf: "flex-end",
    fontWeight: "700",
  },
  systemWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  system: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});