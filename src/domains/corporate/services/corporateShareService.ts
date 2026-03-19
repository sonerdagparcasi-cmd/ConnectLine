// src/domains/corporate/services/corporateShareService.ts
// 🔒 UI-ONLY Share / Copy Service (Corporate Domain)

/**
 * 🔒 ADIM 18.1 — CORPORATE SHARE SERVICE
 *
 * AMAÇ:
 * - Kurumsal profili paylaş (native Share sheet)
 * - Kurumsal profil linkini kopyala (Clipboard)
 * - Share / Link / QR için TEK payload & TEK link kaynağı
 *
 * KURALLAR:
 * - UI-only (backend yok)
 * - Analytics / tracking yok
 * - Domain izolasyonu korunur (sadece Corporate)
 * - Screen'ler Share / Clipboard API bilmez
 * - Gerçek deep link zorunlu değil (hissi yeterli)
 */

import * as Clipboard from "expo-clipboard";
import { Alert, Share } from "react-native";
import type { Company } from "../types/company.types";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type ShareProfileOptions = {
  extraNote?: string;
  linkOverride?: string;
  showErrorAlert?: boolean;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                   */
/* -------------------------------------------------------------------------- */

function sanitizeLine(value: unknown): string {
  const v = String(value ?? "").trim();
  return v.replace(/\s+/g, " ");
}

/**
 * 🔒 TEK SOURCE-OF-TRUTH
 * Share / Copy / QR burada üretilen linki kullanır
 */
export function buildCorporateProfileLink(companyId: string) {
  return `connectline://corporate/company/${encodeURIComponent(companyId)}`;
}

function buildShareMessage(
  company: Company,
  extraNote?: string,
  linkOverride?: string
) {
  const name = sanitizeLine(company.name);
  const sector = sanitizeLine(company.sector);
  const location = sanitizeLine(company.location);
  const desc = sanitizeLine(company.description);

  const link =
    sanitizeLine(linkOverride) || buildCorporateProfileLink(company.id);
  const note = sanitizeLine(extraNote);

  const lines: string[] = [];

  if (name) lines.push(name);
  if (sector) lines.push(sector);
  if (location) lines.push(`📍 ${location}`);
  if (desc) lines.push(desc);

  lines.push("");
  lines.push(link);

  if (note) {
    lines.push("");
    lines.push(note);
  }

  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* SERVICE                                                                    */
/* -------------------------------------------------------------------------- */

class CorporateShareService {
  /* ------------------------------ ADIM 18.1 ------------------------------ */
  async shareCompanyProfile(company: Company, options?: ShareProfileOptions) {
    if (!company?.id) {
      return { ok: false as const, cancelled: false as const };
    }

    const showErrorAlert = options?.showErrorAlert ?? true;

    const message = buildShareMessage(
      company,
      options?.extraNote,
      options?.linkOverride
    );

    try {
      const result = await Share.share(
        {
          title: sanitizeLine(company.name) || "Kurumsal Profil",
          message,
        },
        {
          subject: sanitizeLine(company.name) || "Kurumsal Profil",
        }
      );

      // Platform farkları için güvenli kontrol
    
      const cancelled = result?.action === Share.dismissedAction;

      return { ok: true as const, cancelled: !!cancelled };
    } catch {
      if (showErrorAlert) {
        Alert.alert("Hata", "Profil paylaşımı şu an yapılamadı.");
      }
      return { ok: false as const, cancelled: false as const };
    }
  }

  /* ------------------------------ ADIM 18.2 ------------------------------ */
  async copyCompanyProfileLink(company: Company, showFeedback = true) {
    if (!company?.id) {
      return { ok: false as const };
    }

    try {
      const link = buildCorporateProfileLink(company.id);
      await Clipboard.setStringAsync(link);

      if (showFeedback) {
        Alert.alert("Kopyalandı", "Profil bağlantısı panoya kopyalandı.");
      }

      return { ok: true as const };
    } catch {
      if (showFeedback) {
        Alert.alert("Hata", "Bağlantı kopyalanamadı.");
      }
      return { ok: false as const };
    }
  }
}

/* -------------------------------------------------------------------------- */
/* EXPORTS                                                                    */
/* -------------------------------------------------------------------------- */

export const corporateShareService = new CorporateShareService();

/**
 * 🔒 Yardımcı export
 * QR ve ileri adımlar bu fonksiyonu kullanır
 */
export const corporateShareUtils = {
  buildCorporateProfileLink,
};