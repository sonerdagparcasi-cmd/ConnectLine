import { Alert, Platform } from "react-native";

/**
 * UI-ONLY Push Notification Simülatörü
 * - Gerçek push entegrasyonu DEĞİL (expo-notifications yoksa bile çalışır)
 * - Ama ürün davranışını simüle eder (title + body)
 */
export const chatPushSimulator = {
  notify(title: string, body: string) {
    // iOS/Android fark etmeksizin “bildirim geldi” hissi
    // (App foreground iken gösterim)
    Alert.alert(title, body);

    // İstersen ileride burada:
    // - local banner/toast
    // - badge sayacı
    // - push log listesi
    // eklenebilir (domain içinde).
    void Platform.OS;
  },
};
