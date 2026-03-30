// src/domains/social/screens/SocialCreateEventScreen.tsx
// 🔒 SOCIAL CREATE EVENT – FINAL STABLE
// UPDATE:
// - Event Cover Photo
// - TypeScript safe eventId guard (TS2345 fixed)
// - stable submit flow

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useAppTheme } from "../../../shared/theme/appTheme";

import SocialScreenLayout from "../components/SocialScreenLayout";
import {
  isValidDate,
  isValidTime,
  socialEventService,
} from "../services/socialEventService";

import type { SocialStackParamList } from "../navigation/SocialNavigator";

/* ------------------------------------------------------------------ */

type Route = RouteProp<SocialStackParamList, "SocialCreateEvent">;

/* ------------------------------------------------------------------ */

const formatTime = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

const formatDate = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 4) return digits;
  if (digits.length <= 6)
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
};

const getTodayDate = () => {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function SocialCreateEventScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();

  const editingEventId = route.params?.editingEventId ?? null;
  const isEdit = Boolean(editingEventId);

  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  /* ------------------------------------------------------------------ */
  /* LOAD EVENT (EDIT MODE)                                             */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!editingEventId) return;

    let mounted = true;

    async function loadEvent() {
      try {
        // TS FIX
        const event = await socialEventService.getEventById(
          editingEventId as string
        );

        if (!event || !mounted) return;

        setTitle(event.title ?? "");
        setDescription(event.description ?? "");
        setDate(event.date ?? "");
        setTime(event.time ?? "");
        setLocation(event.location ?? "");
        setCoverImage(event.coverImage ?? undefined);
      } catch {
        console.warn("Event load failed");
      }
    }

    loadEvent();

    return () => {
      mounted = false;
    };
  }, [editingEventId]);

  /* ------------------------------------------------------------------ */
  /* PICK COVER                                                         */
  /* ------------------------------------------------------------------ */

  async function pickCover() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled && res.assets?.length) {
      setCoverImage(res.assets[0].uri);
    }
  }

  /* ------------------------------------------------------------------ */
  /* SUBMIT                                                             */
  /* ------------------------------------------------------------------ */

  async function submit() {
    const cleanTitle = title.trim();
    const finalDate = date || getTodayDate();

    if (!cleanTitle) {
      Alert.alert("Başlık gerekli");
      return;
    }

    if (!isValidDate(finalDate)) {
      Alert.alert("Geçersiz tarih", "Lütfen YYYY-MM-DD formatında girin");
      return;
    }

    if (!isValidTime(time)) {
      Alert.alert("Geçersiz saat", "Lütfen HH:mm formatında girin");
      return;
    }

    try {
      if (isEdit && editingEventId) {
        await socialEventService.updateEvent(editingEventId as string, {
          title: cleanTitle,
          description,
          date: finalDate,
          time,
          location,
          coverImage,
        });

        Alert.alert("Başarılı", "Etkinlik güncellendi");
      } else {
        await socialEventService.createEvent({
          title: cleanTitle,
          description,
          date: finalDate,
          time,
          location,
          coverImage,
        });

        Alert.alert("Başarılı", "Etkinlik oluşturuldu");
        // List UI'nin otomatik refresh alması için önce geri dön, sonra önceki route'u
        // yeni key ile tekrar mount ettir.
        const navState = navigation.getState?.();
        const routes = navState?.routes as
          | Array<{ name?: string; key?: string; params?: unknown }>
          | undefined;
        const prevRoute = routes?.[routes.length - 2];
        const prevName = prevRoute?.name;
        const prevParams = prevRoute?.params;

        navigation.goBack();
        if (prevName) {
          setTimeout(() => {
            try {
              navigation.navigate({
                name: prevName,
                params: prevParams as any,
                key: `${prevName}_${Date.now()}`,
              });
            } catch {
              // Fallback: sadece geri dön.
            }
          }, 0);
        }
        return;
      }

      navigation.goBack();
    } catch {
      Alert.alert("Hata", "İşlem gerçekleştirilemedi");
    }
  }

  const handleDateBlur = () => {
    if (!date) {
      setDate(getTodayDate());
    }
  };

  /* ------------------------------------------------------------------ */

  return (
    <SocialScreenLayout
      title={isEdit ? "Etkinliği Düzenle" : "Etkinlik Oluştur"}
    >
      <View style={styles.container}>
        {/* COVER IMAGE */}

        <Text style={[styles.label, { color: T.textColor }]}>
          Kapak Fotoğrafı
        </Text>

        <TouchableOpacity
          onPress={pickCover}
          activeOpacity={0.9}
          style={[
            styles.coverPicker,
            { borderColor: T.border, backgroundColor: T.cardBg },
          ]}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <Text style={{ color: T.mutedText, fontWeight: "700" }}>
              Kapak foto seç
            </Text>
          )}
        </TouchableOpacity>

        {/* TITLE */}

        <Text style={[styles.label, { color: T.textColor }]}>Başlık</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Topluluk Buluşması"
          placeholderTextColor={T.mutedText}
          style={[
            styles.input,
            {
              borderColor: T.border,
              color: T.textColor,
              backgroundColor: T.cardBg,
            },
          ]}
        />

        {/* DESCRIPTION */}

        <Text style={[styles.label, { color: T.textColor }]}>Açıklama</Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Etkinlik hakkında bilgi..."
          placeholderTextColor={T.mutedText}
          multiline
          style={[
            styles.input,
            styles.textArea,
            {
              borderColor: T.border,
              color: T.textColor,
              backgroundColor: T.cardBg,
            },
          ]}
        />

        {/* DATE */}

        <Text style={[styles.label, { color: T.textColor }]}>Tarih</Text>

        <TextInput
          value={date}
          onChangeText={(text) => {
            const formatted = formatDate(text);
            setDate(formatted);
          }}
          placeholder={getTodayDate()}
          keyboardType="numeric"
          onBlur={handleDateBlur}
          placeholderTextColor={T.mutedText}
          style={[
            styles.input,
            {
              borderColor: T.border,
              color: T.textColor,
              backgroundColor: T.cardBg,
            },
          ]}
        />

        {/* TIME */}

        <Text style={[styles.label, { color: T.textColor }]}>Saat</Text>

        <TextInput
          value={time}
          onChangeText={(text) => {
            const formatted = formatTime(text);
            setTime(formatted);
          }}
          placeholder="19:00"
          keyboardType="numeric"
          placeholderTextColor={T.mutedText}
          style={[
            styles.input,
            {
              borderColor: T.border,
              color: T.textColor,
              backgroundColor: T.cardBg,
            },
          ]}
        />

        {/* LOCATION */}

        <Text style={[styles.label, { color: T.textColor }]}>Konum</Text>

        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Ülke / Şehir"
          placeholderTextColor={T.mutedText}
          style={[
            styles.input,
            {
              borderColor: T.border,
              color: T.textColor,
              backgroundColor: T.cardBg,
            },
          ]}
        />

        {/* BUTTON */}

        <TouchableOpacity
          onPress={submit}
          style={[styles.btnPrimary, { backgroundColor: T.accent }]}
        >
          <Text style={styles.btnText}>
            {isEdit ? "Etkinliği Güncelle" : "Etkinliği Oluştur"}
          </Text>
        </TouchableOpacity>
      </View>
    </SocialScreenLayout>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },

  label: {
    marginTop: 14,
    fontWeight: "800",
  },

  coverPicker: {
    marginTop: 8,
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  coverImage: {
    width: "100%",
    height: "100%",
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },

  textArea: {
    minHeight: 80,
  },

  btnPrimary: {
    marginTop: 24,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "900",
  },
});