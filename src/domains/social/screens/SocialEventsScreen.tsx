// src/domains/social/screens/SocialEventsScreen.tsx
// 🔒 SOCIAL – EVENTS LIST (STABİL, UI-ONLY)
// + Etkinlik oluştur butonu eklendi

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { SocialEvent, socialEventService } from "../services/socialEventService";

export default function SocialEventsScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<SocialEvent[]>([]);

  const loadEvents = useCallback(() => {
    socialEventService.getEvents().then(setEvents);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  function goCreateEvent() {
    navigation.navigate("SocialCreateEvent");
  }

  if (!events.length) {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <TouchableOpacity
          onPress={goCreateEvent}
          style={[styles.createBtn, { backgroundColor: T.accent }]}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.createText}>Etkinlik Oluştur</Text>
        </TouchableOpacity>

        <Text style={{ color: T.mutedText, fontWeight: "800", marginTop: 12 }}>
          Henüz etkinlik yok
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <TouchableOpacity
        onPress={goCreateEvent}
        style={[styles.createBtn, { backgroundColor: T.accent }]}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.createText}>Etkinlik Oluştur</Text>
      </TouchableOpacity>

      {events.map((event) => (
        <TouchableOpacity
          key={event.id}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("SocialEventDetail", {
              eventId: event.id,
            })
          }
          style={[
            styles.card,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <Text style={[styles.title, { color: T.textColor }]}>
            {event.title}
          </Text>

          <Text style={{ color: T.mutedText, marginTop: 4 }}>
            {event.date} · {event.location}
          </Text>

          <Text style={{ color: T.mutedText, marginTop: 6 }}>
            👥 {event.participants} katılımcı
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 6,
  },

  createText: {
    color: "#fff",
    fontWeight: "900",
  },

  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  title: {
    fontWeight: "900",
    fontSize: 15,
  },
});