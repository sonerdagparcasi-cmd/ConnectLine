// src/domains/corporate/components/ProfileVisitorActions.tsx
// 🔒 FAZ 4A.3 — Visitor Actions (FOLLOW + SAVE + CONTACT, UI-only)

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { companyService } from "../services/companyService";

type Props = {
  isOwner: boolean;
  website?: string | null;
  companyId: string;
  initialFollowing?: boolean;
};

function normalizeUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default function ProfileVisitorActions({
  isOwner,
  website,
  companyId,
  initialFollowing = false,
}: Props) {
  const T = useAppTheme();

  if (isOwner) return null;

  const [followed, setFollowed] = useState(initialFollowing);
  const [saved, setSaved] = useState(false);

  const hasWebsite = !!website && website.trim().length > 0;

  /* ------------------------------------------------------------------ */
  /* FOLLOW                                                             */
  /* ------------------------------------------------------------------ */

  const handleFollow = async () => {
    const next = !followed;

    setFollowed(next);

    try {
      if (next) {
        await companyService.followCompany(companyId);
      } else {
        await companyService.unfollowCompany(companyId);
      }
    } catch {
      setFollowed(!next);
    }
  };

  /* ------------------------------------------------------------------ */
  /* WEBSITE                                                            */
  /* ------------------------------------------------------------------ */

  const handleWebsite = () => {
    if (!website) return;

    const url = normalizeUrl(website);

    Linking.openURL(url).catch(() => {});
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <View style={styles.row}>
        {/* FOLLOW */}

        <TouchableOpacity
          onPress={handleFollow}
          style={styles.action}
          activeOpacity={0.85}
        >
          <Ionicons
            name={followed ? "checkmark-circle" : "add-circle-outline"}
            size={18}
            color={followed ? T.accent : T.textColor}
          />

          <Text
            style={[
              styles.label,
              { color: followed ? T.accent : T.textColor },
            ]}
          >
            {followed ? "Takiptesin" : "Takip Et"}
          </Text>
        </TouchableOpacity>

        {/* SAVE */}

        <TouchableOpacity
          onPress={() => setSaved((prev) => !prev)}
          style={styles.action}
          activeOpacity={0.85}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={saved ? T.accent : T.textColor}
          />

          <View>
            <Text
              style={[
                styles.label,
                { color: saved ? T.accent : T.textColor },
              ]}
            >
              {saved ? "Kaydedildi" : "Kaydet"}
            </Text>

            {saved && (
              <Text style={[styles.hint, { color: T.mutedText }]}>
                Sonra bakmak için eklendi
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* CONTACT */}

      {hasWebsite && (
        <View style={styles.contactWrap}>
          <TouchableOpacity
            onPress={handleWebsite}
            activeOpacity={0.85}
            style={styles.contactBtn}
          >
            <Ionicons name="globe-outline" size={16} color={T.textColor} />

            <Text style={[styles.contactText, { color: T.textColor }]}>
              Web Sitesini Ziyaret Et
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 12,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
  },
  hint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
  },
  contactWrap: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderStyle: "dashed",
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 12,
    fontWeight: "800",
  },
});