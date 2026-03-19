// src/domains/corporate/components/CorporateProfileQrCard.tsx
// 🔒 ADIM 13.3 — QR (UI-only)

import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { corporateShareUtils } from "../services/corporateShareService";

/**
 * 🔒 CorporateProfileQrCard
 *
 * AMAÇ:
 * - Kurumsal profil linki için QR üretmek
 * - UI-only, backend yok
 *
 * KURALLAR:
 * - Sadece görsel üretir
 * - Link formatı Share servisi ile TEK KAYNAK
 */
 
type Props = {
  companyId: string;
  title?: string;
  size?: number;
};

export default function CorporateProfileQrCard({
  companyId,
  title = "QR ile paylaş",
  size = 160,
}: Props) {
  const T = useAppTheme();

  const value = corporateShareUtils.buildCorporateProfileLink(companyId);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Text style={[styles.title, { color: T.textColor }]}>{title}</Text>

      <View style={styles.qrWrap}>
        <QRCode
          value={value}
          size={size}
          backgroundColor="transparent"
          color={T.textColor}
        />
      </View>

      <Text style={[styles.hint, { color: T.mutedText }]}>
        Profili açmak için QR kodu okutun
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "900",
  },

  qrWrap: {
    padding: 10,
    borderRadius: 12,
  },

  hint: {
    fontSize: 12,
    textAlign: "center",
  },
});