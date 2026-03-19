// src/domains/store/screens/StoreLiveCommerceScreen.tsx
// 🔒 STORE LIVE COMMERCE – UI ONLY / STABLE

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

type LiveMessage = {
  id: string;
  user: string;
  text: string;
};

export default function StoreLiveCommerceScreen() {
  const T = useAppTheme();

  /* --------------------------------------------------------------- */
  /* STATE                                                           */
  /* --------------------------------------------------------------- */

  const [viewers] = useState(152);

  const [messages, setMessages] = useState<LiveMessage[]>([
    { id: "1", user: "Ali", text: "fiyat nedir?" },
    { id: "2", user: "Ayşe", text: "kargo var mı?" },
    { id: "3", user: "Mehmet", text: "stok kaç adet?" },
  ]);

  const [product] = useState({
    title: "Kulaklık Pro X",
    price: 1299,
  });

  /* --------------------------------------------------------------- */
  /* ACTIONS                                                         */
  /* --------------------------------------------------------------- */

  function sendMessage() {
    const newMessage: LiveMessage = {
      id: String(Date.now()),
      user: "Sen",
      text: "Harika ürün!",
    };

    setMessages((prev) => [...prev, newMessage]);
  }

  /* --------------------------------------------------------------- */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={[styles.liveText, { color: T.textColor }]}>
          🔴 CANLI
        </Text>

        <View style={styles.viewerRow}>
          <Ionicons name="eye-outline" size={16} color={T.mutedText} />
          <Text style={{ color: T.mutedText }}>{viewers}</Text>
        </View>
      </View>

      {/* VIDEO PLACEHOLDER */}

      <View style={[styles.video, { backgroundColor: T.cardBg }]}>
        <Text style={{ color: T.mutedText }}>
          Live Stream Placeholder
        </Text>
      </View>

      {/* PINNED PRODUCT */}

      <View
        style={[
          styles.productCard,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <Text style={[styles.productTitle, { color: T.textColor }]}>
          {product.title}
        </Text>

        <Text style={[styles.price, { color: T.accent }]}>
          ₺{product.price}
        </Text>

        <TouchableOpacity
          style={[styles.buyButton, { backgroundColor: T.accent }]}
        >
          <Text style={styles.buyText}>
            Hemen Satın Al
          </Text>
        </TouchableOpacity>
      </View>

      {/* CHAT */}

      <View
        style={[
          styles.chatBox,
          { borderColor: T.border, backgroundColor: T.cardBg },
        ]}
      >
        {messages.map((m) => (
          <Text key={m.id} style={{ color: T.mutedText }}>
            {m.user}: {m.text}
          </Text>
        ))}

        <TouchableOpacity onPress={sendMessage}>
          <Text style={{ color: T.accent, marginTop: 6 }}>
            Mesaj Gönder
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  liveText: {
    fontSize: 16,
    fontWeight: "900",
  },

  viewerRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  video: {
    height: 220,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  productCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },

  productTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  price: {
    fontSize: 16,
    fontWeight: "900",
  },

  buyButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buyText: {
    color: "#fff",
    fontWeight: "900",
  },

  chatBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    gap: 6,
  },

});