// src/domains/corporate/navigation/CorporateTabsNavigator.tsx
// 🔒 STABİL & KİLİTLİ
// Bottom Tab = Kurumsal "Benim Alanım / Profil Container"
// FIX:
// - Tab bar tamamen gizlendi (corporate kendi alt bar kullanmaz)
// - CoreNavigator alt bar ile çakışma engellendi

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";

import { useCorporateHomeBadges } from "../home/hooks/useCorporateHomeBadges";
import CorporateJobsScreen from "../jobs/screens/CorporateJobsScreen";
import CorporateInboxScreen from "../messaging/screens/CorporateInboxScreen";
import CorporateNetworkScreen from "../network/screens/CorporateNetworkScreen";
import CorporateProfileContainerScreen from "../screens/CorporateProfileContainerScreen";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type CorporateTabsParamList = {
  CorporateTabHome: undefined;
  CorporateTabJobs: undefined;
  CorporateTabNetwork: undefined;
  CorporateTabInbox: undefined;
};

const Tab = createBottomTabNavigator<CorporateTabsParamList>();

/* ------------------------------------------------------------------ */
/* NAVIGATOR                                                          */
/* ------------------------------------------------------------------ */

export default function CorporateTabsNavigator() {
  const T = useAppTheme();
  const { badges } = useCorporateHomeBadges();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        // 🔒 CORE FIX
        // Corporate domain kendi alt tab barını göstermez
        tabBarStyle: { display: "none" },

        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: T.accent,
        tabBarInactiveTintColor: T.mutedText,
      }}
    >
      {/* ---------------- Home / Vitrin ---------------- */}

      <Tab.Screen
        name="CorporateTabHome"
        component={CorporateProfileContainerScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} text={t("corporate.tab.home")} />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size ?? 20} />
          ),
        }}
      />

      {/* ---------------- Jobs ---------------- */}

      <Tab.Screen
        name="CorporateTabJobs"
        component={CorporateJobsScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} text={t("corporate.tab.jobs")} />
          ),
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              icon="briefcase-outline"
              color={color}
              size={size ?? 20}
              badge={badges.jobsOpen}
            />
          ),
        }}
      />

      {/* ---------------- Network ---------------- */}

      <Tab.Screen
        name="CorporateTabNetwork"
        component={CorporateNetworkScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} text={t("corporate.tab.network")} />
          ),
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              icon="people-outline"
              color={color}
              size={size ?? 20}
              badge={badges.networkRequests}
            />
          ),
        }}
      />

      {/* ---------------- Inbox ---------------- */}

      <Tab.Screen
        name="CorporateTabInbox"
        component={CorporateInboxScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} text={t("corporate.tab.inbox")} />
          ),
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              icon="chatbubble-ellipses-outline"
              color={color}
              size={size ?? 20}
              badge={badges.inboxUnread}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/* ------------------------------------------------------------------ */
/* UI HELPERS                                                         */
/* ------------------------------------------------------------------ */

function TabLabel({ text, color }: { text: string; color: string }) {
  return (
    <View style={{ marginTop: -2 }}>
      <Text style={{ fontSize: 11, fontWeight: "800", color }} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function TabIcon({
  icon,
  color,
  size,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  badge?: number;
}) {
  const T = useAppTheme();
  const show = typeof badge === "number" && badge > 0;
  const text =
    typeof badge === "number" && badge > 99 ? "99+" : String(badge ?? "");

  return (
    <View style={{ width: 26, height: 22 }}>
      <Ionicons name={icon} color={color} size={size} />

      {show ? (
        <View
          style={{
            position: "absolute",
            right: -10,
            top: -6,
            minWidth: 18,
            height: 16,
            paddingHorizontal: 5,
            borderRadius: 8,
            backgroundColor: T.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>
            {text}
          </Text>
        </View>
      ) : null}
    </View>
  );
}