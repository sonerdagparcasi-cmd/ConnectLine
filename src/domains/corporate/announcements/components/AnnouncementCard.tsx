// src/domains/corporate/announcements/components/AnnouncementCard.tsx

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { CorporateAnnouncement } from "../types/announcement.types";
import EventMeta from "./EventMeta";

export default function AnnouncementCard({
  item,
}: {
  item: CorporateAnnouncement;
}) {
  const T = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 16 }}>
        {item.title}
      </Text>

      <Text style={{ color: T.mutedText, marginTop: 6 }}>
        {item.description}
      </Text>

      {item.type === "event" && (
        <View style={{ marginTop: 10 }}>
          <EventMeta
            date={item.eventDate}
            location={item.location}
            isOnline={item.isOnline}
          />
        </View>
      )}

      <Text style={[styles.time, { color: T.mutedText }]}>
        {new Date(item.createdAt).toLocaleDateString("tr-TR")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 14,
    marginVertical: 8,
    gap: 6,
  },
  time: {
    marginTop: 10,
    fontSize: 12,
    alignSelf: "flex-end",
  },
});