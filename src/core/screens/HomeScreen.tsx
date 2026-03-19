// src/core/screens/HomeScreen.tsx

import { StyleSheet, View } from "react-native";

import CorporateFeedScreen from "../../domains/corporate/feed/screens/CorporateFeedScreen";
import SocialFeedScreen from "../../domains/social/screens/SocialFeedScreen";
import StoreCatalogScreen from "../../domains/store/screens/StoreCatalogScreen";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type HomeMode =
  | "chat"        // Mesajlar (ChatNavigator tarafından açılır)
  | "corporate"   // Kurumsal feed
  | "store"       // Mağaza vitrini
  | "social";     // Sosyal akış

type Props = {
  mode: HomeMode;
};

/**
 * 🔒 CORE HOME SCREEN (KİLİTLİ – GENİŞLETİLEBİLİR)
 *
 * KURALLAR:
 * - Domain logic içermez
 * - Provider içermez
 * - Navigation içermez
 *
 * ⚠️ CHAT ÖZEL KURALI:
 * - Chat ekranları burada render EDİLMEZ
 * - Chat SADECE ChatNavigator içinde çalışır
 *
 * HomeScreen’in tek görevi:
 * → Home tab altında hangi domain vitrini gösterilecek, onu seçmek
 */

export default function HomeScreen({ mode }: Props) {
  switch (mode) {
    /**
     * 1️⃣ MESAJLAR
     * ChatHomeScreen burada GÖSTERİLMEZ
     * Üst menü "Mesajlar" → CoreNavigator activeBottom="chat" yapar
     * → ChatNavigator devreye girer
     */
    case "chat":
      return <View style={styles.container} />;

    /**
     * 2️⃣ KURUMSAL
     * Takip edilen / paylaşılan kurumsal feed
     */
    case "corporate":
      return <CorporateFeedScreen />;

    /**
     * 3️⃣ MAĞAZA
     * Tüm satıcıların ürün vitrini
     */
    case "store":
      return <StoreCatalogScreen />;

    /**
     * 4️⃣ SOSYAL
     * Sosyal medya ana akışı (Instagram benzeri)
     */
    case "social":
      return <SocialFeedScreen />;

    default:
      return <View style={styles.container} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
