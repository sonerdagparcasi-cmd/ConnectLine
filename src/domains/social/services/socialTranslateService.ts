// src/domains/social/services/socialTranslateService.ts

/**
 * 🔒 Çeviri desteği (UI-only):
 * - Caption / yorum / açıklama gibi metinler için "çevir" butonu.
 * - Şimdilik mock: metni aynı döndürür.
 * - İleride gerçek translate provider sadece Social domain içinde bağlanır.
 */
export const socialTranslateService = {
  async translate(text: string, _toLocale: string): Promise<string> {
    return text; // UI-only mock
  },
};