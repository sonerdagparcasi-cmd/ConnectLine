import { useNavigation } from "@react-navigation/native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export default function CorporateFeedHeader() {
  const navigation = useNavigation();
  const T = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        width: "100%",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            marginRight: 8,
          }}
        />

        <Text
          style={{
            color: T.textColor,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          Kurumsal profildesin
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("CorporateProfile" as never)}
      >
        <Text style={{ color: T.primary, fontWeight: "600" }}>
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
}