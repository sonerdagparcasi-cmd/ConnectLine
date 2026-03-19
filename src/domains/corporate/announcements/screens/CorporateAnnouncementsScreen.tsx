// src/domains/corporate/announcements/screens/CorporateAnnouncementsScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import AnnouncementCard from "../components/AnnouncementCard";
import { useCorporateAnnouncements } from "../hooks/useCorporateAnnouncements";

export default function CorporateAnnouncementsScreen({ navigation }: any) {
  const T = useAppTheme();
  const { items } = useCorporateAnnouncements();

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <AnnouncementCard item={item} />}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("CorporateCreateAnnouncement")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 30,
          backgroundColor: T.accent,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}