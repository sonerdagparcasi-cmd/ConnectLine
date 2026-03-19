// src/domains/corporate/announcements/screens/CorporateCreateAnnouncementScreen.tsx

import { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCorporateAnnouncements } from "../hooks/useCorporateAnnouncements";

export default function CorporateCreateAnnouncementScreen({ navigation }: any) {
  const T = useAppTheme();
  const { create } = useCorporateAnnouncements();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit() {
    if (!title.trim() || !description.trim()) return;

    await create({
      companyId: "c1",
      companyName: "ConnectLine Tech",
      type: "announcement",
      title: title.trim(),
      description: description.trim(),
    });

    navigation.goBack();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.backgroundColor, padding: 16 }}>
      <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 18 }}>
        Duyuru Oluştur
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Başlık"
        placeholderTextColor={T.mutedText}
        style={{ color: T.textColor, borderBottomWidth: 1, borderColor: T.border, marginTop: 20 }}
      />

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Açıklama"
        placeholderTextColor={T.mutedText}
        multiline
        style={{
          color: T.textColor,
          borderWidth: 1,
          borderColor: T.border,
          borderRadius: 12,
          padding: 10,
          marginTop: 20,
          minHeight: 120,
        }}
      />

      <TouchableOpacity
        onPress={onSubmit}
        style={{
          marginTop: 24,
          backgroundColor: T.accent,
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900" }}>Paylaş</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}