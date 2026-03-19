import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import { useCorporateIdentity } from "../hook/useCorporateIdentity";

export default function CorporateIdentitySelectScreen() {
  const T = useAppTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<CorporateStackParamList>>();

  const { selectType } = useCorporateIdentity();

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        gap: 24,
        backgroundColor: T.backgroundColor,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          textAlign: "center",
          color: T.textColor,
        }}
      >
        Kurumsal Alanda Kim Olarak Yer Almak İstiyorsun?
      </Text>

      <TouchableOpacity
        onPress={async () => {
          await selectType("company");
          navigation.navigate("CorporateIdentityCreate");
        }}
        style={{
          padding: 20,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: T.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: T.textColor }}>
          🏢 Şirket Oluşturmak / Yönetmek
        </Text>
        <Text style={{ color: T.mutedText }}>
          İlan ver, ekip kur, marka oluştur
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          await selectType("individual");
          navigation.navigate("CorporateIdentityCreate");
        }}
        style={{
          padding: 20,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: T.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: T.textColor }}>
          👤 Bireysel Kurumsal Kimlik
        </Text>
        <Text style={{ color: T.mutedText }}>
          Başvur, danışmanlık ver, ağ kur
        </Text>
      </TouchableOpacity>
    </View>
  );
}