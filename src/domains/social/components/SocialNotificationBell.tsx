// src/domains/social/components/SocialNotificationBell.tsx
// FAZ 5 / ADIM 4 — bildirim zili + okunmamış rozeti

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { SocialStackParamList } from "../navigation/SocialNavigator";
import {
  getUnreadCount,
  subscribeNotifications,
} from "../services/socialNotificationService";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

type Props = {
  iconColor: string;
};

export default function SocialNotificationBell({ iconColor }: Props) {
  const navigation = useNavigation<Nav>();
  const [count, setCount] = useState(() => getUnreadCount());

  useEffect(() => {
    const unsub = subscribeNotifications(() => setCount(getUnreadCount()));
    return unsub;
  }, []);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("SocialNotifications")}
      activeOpacity={0.85}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.wrap}
    >
      <Ionicons name="notifications-outline" size={22} color={iconColor} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 36,
    minHeight: 36,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
