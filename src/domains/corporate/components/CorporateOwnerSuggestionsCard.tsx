import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { Company } from "../types/company.types";

/**
 * 🔒 CorporateOwnerSuggestionsCard (ADIM 7)
 *
 * Amaç:
 * - Sahibe "şimdi ne yapabilirsin" hissi vermek
 * - Baskı yok, uyarı yok
 * - Sadece yön gösterme
 *
 * Kurallar:
 * - UI only
 * - Backend varsayımı yok
 * - Karar logic’i burada minimal
 */

type Props = {
  company: Company;
  hasAvatar: boolean;
  onCreatePost?: () => void;
  onCreateJob?: () => void;
};

export default function CorporateOwnerSuggestionsCard({
  company,
  hasAvatar,
  onCreatePost,
  onCreateJob,
}: Props) {
  const T = useAppTheme();

  const suggestions: {
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    action?: () => void;
  }[] = [];

  if (!hasAvatar) {
    suggestions.push({
      key: "avatar",
      icon: "image",
      text: "Profil fotoğrafı ekleyerek güveni artırabilirsin",
    });
  }

  if (!company.description) {
    suggestions.push({
      key: "desc",
      icon: "document-text",
      text: "Kısa bir şirket açıklaması eklemek faydalı olur",
    });
  }

  suggestions.push({
    key: "post",
    icon: "add-circle",
    text: "Yeni bir paylaşım yaparak görünürlüğünü artır",
    action: onCreatePost,
  });

  suggestions.push({
    key: "job",
    icon: "briefcase",
    text: "İş ilanı oluşturarak yeteneklere ulaş",
    action: onCreateJob,
  });

  if (suggestions.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Text style={[styles.title, { color: T.textColor }]}>
        Bugün için küçük öneriler
      </Text>

      {suggestions.map((s) => (
        <TouchableOpacity
          key={s.key}
          activeOpacity={s.action ? 0.85 : 1}
          onPress={s.action}
          style={styles.row}
        >
          <Ionicons
            name={s.icon}
            size={18}
            color={T.mutedText}
          />
          <Text style={[styles.text, { color: T.mutedText }]}>
            {s.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  text: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});