import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

/**
 * 🔒 ProfileEngagementHint
 *
 * AMAÇ:
 * - Profilde “yaşıyor” hissi
 * - UI-only, backend yok
 * - Kesin sayı yok (aralık/ifade)
 *
 * KURALLAR:
 * - useCompany / service kullanılmaz
 * - Screen hesap yapmaz
 * - Veri yoksa render edilmez
 */

type Props = {
  /**
   * opsiyonel bağlam:
   * - "profile" | "posts" | "network"
   * sadece metin varyasyonu için
   */
  context?: "profile" | "posts" | "network";
};

const COPY_MAP: Record<
  NonNullable<Props["context"]>,
  string[]
> = {
  profile: [
    "Bu profil son günlerde ilgi görüyor",
    "Profil etkileşimi artışta",
    "Son dönemde daha fazla kişi profili inceliyor",
  ],
  posts: [
    "Son paylaşımlar etkileşim aldı",
    "Paylaşımlar son günlerde daha fazla görüntülendi",
  ],
  network: [
    "Bu şirket ağda daha görünür hale geliyor",
    "Ağ etkileşimi artış gösteriyor",
  ],
};

function pickDeterministic(list: string[]) {
  if (!list || list.length === 0) return null;
  // UI-only, deterministik: gün bazlı seç
  const day = new Date().getDate();
  return list[day % list.length];
}

export default function ProfileEngagementHint({ context = "profile" }: Props) {
  const T = useAppTheme();

  const text = pickDeterministic(COPY_MAP[context]);
  if (!text) return null;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: T.accent },
        ]}
      />
      <Text style={[styles.text, { color: T.textColor }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});