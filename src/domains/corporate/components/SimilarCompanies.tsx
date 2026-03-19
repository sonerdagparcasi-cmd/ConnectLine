// src/domains/corporate/components/SimilarCompanies.tsx
// 🔒 FAZ 6 — Similar Companies (UI-only, Visitor Discovery)

import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type CompanyMini = {
  id: string;
  name: string;
  sector: string;
};

type Props = {
  currentCompanyId: string;
  sector?: string;
  onOpen: (companyId: string) => void;
};

const MOCK_SIMILAR: CompanyMini[] = [
  { id: "c2", name: "Nova Teknoloji", sector: "Teknoloji" },
  { id: "c3", name: "Atlas Yazılım", sector: "Teknoloji" },
  { id: "c4", name: "Pioneer Digital", sector: "Teknoloji" },
];

export default function SimilarCompanies({
  currentCompanyId,
  sector,
  onOpen,
}: Props) {
  const T = useAppTheme();

  const items = MOCK_SIMILAR
    .filter((c) => c.id !== currentCompanyId)
    .filter((c) => (!sector ? true : c.sector === sector))
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <View style={{ marginTop: 14 }}>
      <Text
        style={{
          marginLeft: 16,
          marginBottom: 8,
          fontSize: 13,
          fontWeight: "900",
          color: T.textColor,
        }}
      >
        Benzer Kurumlar
      </Text>

      <View style={{ gap: 8 }}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onOpen(item.id)}
            activeOpacity={0.8}
            style={{
              marginHorizontal: 16,
              padding: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.cardBg,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: T.backgroundColor,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Ionicons name="business" size={18} color={T.mutedText} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "800",
                  color: T.textColor,
                  fontSize: 13,
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: T.mutedText,
                  fontWeight: "700",
                }}
              >
                {item.sector}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}