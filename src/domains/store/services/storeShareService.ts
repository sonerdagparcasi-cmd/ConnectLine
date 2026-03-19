// src/domains/store/services/storeShareService.ts
import { Platform, Share } from "react-native";

import { t } from "../../../shared/i18n/t";
import type { StoreProduct, StoreSeller } from "../types/store.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type SharePayload = {
  title?: string;
  message: string;
  url?: string;
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function buildProductSharePayload(
  product: StoreProduct,
  seller?: StoreSeller | null
): SharePayload {
  const sellerText = seller?.name
    ? `${t("store.share.seller")}: ${seller.name}`
    : "";

  const stockText = product.inStock
    ? t("store.share.inStock")
    : t("store.share.outOfStock");

  const url = `connectline://store/product/${product.id}`;
  const title = product.title;

  const message = [
    `${t("store.share.product")}: ${product.title}`,
    sellerText,
    `${t("store.share.price")}: ${product.price} ${product.currency}`,
    `${t("store.share.status")}: ${stockText}`,
    `${t("store.share.link")}: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { title, message, url };
}

async function share(payload: SharePayload) {
  try {
    // iOS → title + message + url desteklenir
    if (Platform.OS === "ios") {
      return await Share.share({
        title: payload.title,
        message: payload.message,
        url: payload.url,
      });
    }

    // Android → url çoğu hedefte dikkate alınmaz (message içinde zaten var)
    return await Share.share({
      title: payload.title,
      message: payload.message,
    });
  } catch {
    return null;
  }
}

/**
 * Clipboard (opsiyonel):
 * - Önce expo-clipboard varsa kullanır
 * - Yoksa @react-native-clipboard/clipboard varsa kullanır
 * - Hiçbiri yoksa fallback: metni döner (UI tarafı isterse manuel kopyalama/alert yapar)
 *
 * Not: require() kullanıyoruz ki paketin yüklü olmaması TS derlemesini kırmasın.
 */
async function trySetClipboard(text: string): Promise<boolean> {
  // 1) expo-clipboard
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ExpoClipboard = require("expo-clipboard") as {
      setStringAsync?: (value: string) => Promise<void>;
      setString?: (value: string) => void;
    };

    if (ExpoClipboard?.setStringAsync) {
      await ExpoClipboard.setStringAsync(text);
      return true;
    }
    if (ExpoClipboard?.setString) {
      ExpoClipboard.setString(text);
      return true;
    }
  } catch {
    // ignore
  }

  // 2) @react-native-clipboard/clipboard
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNClipboard = require("@react-native-clipboard/clipboard") as {
      setString?: (value: string) => void;
    };

    if (RNClipboard?.setString) {
      RNClipboard.setString(text);
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

async function copyFallback(text: string) {
  const ok = await trySetClipboard(text);
  // ok true ise kopyalandı; false ise sadece text döndürüyoruz.
  return text;
}

/* ------------------------------------------------------------------ */
/* SERVICE (KİLİTLİ CONTRACT)                                         */
/* ------------------------------------------------------------------ */

export const storeShareService = {
  /* ----------------------- */
  /* PRODUCT SHARE           */
  /* ----------------------- */

  async copyProductText(product: StoreProduct, seller?: StoreSeller | null) {
    const payload = buildProductSharePayload(product, seller);
    return await copyFallback(payload.message);
  },

  async shareProduct(product: StoreProduct, seller?: StoreSeller | null) {
    const payload = buildProductSharePayload(product, seller);
    return await share(payload);
  },

  /* ----------------------- */
  /* GENERIC SHARE           */
  /* ----------------------- */

  async copyText(text: string) {
    return await copyFallback(text);
  },

  async shareText(payload: SharePayload) {
    return await share(payload);
  },
};