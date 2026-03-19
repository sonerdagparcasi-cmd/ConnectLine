// src/core/navigation/CoreNavigator.tsx
// 🔒 CORE NAVIGATOR — GLOBAL DOMAIN ROUTER (STABLE)
// Kurallar:
// - Domain isolation korunur
// - Core yalnızca navigator yönlendirir
// - Her domain kendi navigator'ına sahiptir

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { useChatBadges } from "../../domains/chat/hooks/useChatBadges";
import ChatNavigator from "../../domains/chat/navigation/ChatNavigator";
import CorporateJobsFeedScreen from "../../domains/corporate/jobs/screens/CorporateJobsFeedScreen";
import CorporateNavigator from "../../domains/corporate/navigation/CorporateNavigator";
import JobApplicationsScreen from "../../domains/corporate/recruitment/screens/JobApplicationsScreen";
import SocialNavigator from "../../domains/social/navigation/SocialNavigator";
import StoreNavigator from "../../domains/store/navigation/StoreNavigator";
import StoreSellerNavigator from "../../domains/storeSeller/navigation/StoreSellerNavigator";

import AppShell, { BottomTabKey } from "../layouts/AppShell";
import { HomeMode } from "../screens/HomeScreen";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type CoreStackParamList = {
  Home: undefined;
  StoreSeller: undefined;
};

type Props = {
  onLogout: () => void;
};

/* ------------------------------------------------------------------ */
/* STACK                                                              */
/* ------------------------------------------------------------------ */

const Stack = createNativeStackNavigator<CoreStackParamList>();

function Placeholder() {
  return <View style={styles.placeholder} />;
}

export default function CoreNavigator({ onLogout }: Props) {
  const [activeBottom, setActiveBottom] = useState<BottomTabKey>("home");
  const [activeTop, setActiveTop] = useState<string>("Mesajlar");
  const { badges } = useChatBadges();

  /**
   * 🔒 HOME MODE
   * Domain keşif dünyası
   */
  const [homeMode, setHomeMode] = useState<HomeMode>("chat");

  /* ------------------------------------------------------------------ */
  /* NAVIGATOR WRAPPERS                                                */
  /* ------------------------------------------------------------------ */

  const ChatNav = useMemo(() => {
    return ChatNavigator as unknown as React.ComponentType<{
      entry: "list" | "home";
    }>;
  }, []);

  const SocialNav = useMemo(() => {
    return SocialNavigator as unknown as React.ComponentType<{
      entry: "feed" | "profile";
    }>;
  }, []);

  /* ------------------------------------------------------------------ */
  /* TOP TAB CHANGE                                                     */
  /* ------------------------------------------------------------------ */

  function handleTopTabChange(tab: string) {
    setActiveTop(tab);
    setActiveBottom("home");

    switch (tab) {
      case "Mesajlar":
        setHomeMode("chat");
        break;

      case "Kurumsal":
        setHomeMode("corporate");
        break;

      case "Mağaza":
        setHomeMode("store");
        break;

      case "Sosyal":
        setHomeMode("social");
        break;

      case "İş İlanları":
      case "Başvurular":
        break;

      default:
        setHomeMode("chat");
        break;
    }
  }

  const isJobsTop = activeTop === "İş İlanları";
  const isApplicationsTop = activeTop === "Başvurular";

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* =============================================================== */}
      {/* HOME / APP SHELL                                               */}
      {/* =============================================================== */}

      <Stack.Screen name="Home">
        {() => (
          <AppShell
            onLogout={onLogout}
            activeTop={activeTop}
            activeBottom={activeBottom}
            onSelectTab={setActiveBottom}
            onTopTabChange={handleTopTabChange}
            chatBadge={badges.unreadMessages}
          >
            {/* ========================================================= */}
            {/* 🔝 GLOBAL ÜST MENÜ (KEŞİF / FEED DÜNYASI)                 */}
            {/* ========================================================= */}

            {activeBottom === "home" && isJobsTop && (
              <CorporateJobsFeedScreen />
            )}

            {activeBottom === "home" && isApplicationsTop && (
              <JobApplicationsScreen />
            )}

            {/* CHAT FEED */}
            {activeBottom === "home" &&
              !isJobsTop &&
              !isApplicationsTop &&
              homeMode === "chat" && (
                <ChatNav key="chat-feed" entry="list" />
              )}

            {/* CORPORATE FEED */}
            {activeBottom === "home" &&
              !isJobsTop &&
              !isApplicationsTop &&
              homeMode === "corporate" && (
                <CorporateNavigator entry="feed" />
              )}

            {/* STORE FEED */}
            {activeBottom === "home" &&
              !isJobsTop &&
              !isApplicationsTop &&
              homeMode === "store" && <StoreNavigator />}

            {/* SOCIAL FEED */}
            {activeBottom === "home" &&
              !isJobsTop &&
              !isApplicationsTop &&
              homeMode === "social" && (
                <SocialNav entry="feed" />
              )}

            {/* ========================================================= */}
            {/* 🔻 ALT MENÜ = BENİM ALANIM / PROFİL                       */}
            {/* ========================================================= */}

            {/* CHAT PROFILE */}
            {activeBottom === "chat" && (
              <ChatNav key="chat-home" entry="home" />
            )}

            {/* CORPORATE PROFILE */}
            {activeBottom === "corporate" && (
              <CorporateNavigator entry="profile" />
            )}

            {/* STORE PROFILE */}
            {activeBottom === "store" && <StoreNavigator />}

            {/* SOCIAL PROFILE */}
            {activeBottom === "social" && (
              <SocialNav entry="profile" />
            )}

            {/* VIDEO PLACEHOLDER */}
            {activeBottom === "video" && <Placeholder />}
          </AppShell>
        )}
      </Stack.Screen>

      {/* =============================================================== */}
      {/* 🛍️ STORE SELLER – AYRI DÜNYA                                   */}
      {/* =============================================================== */}

      <Stack.Screen
        name="StoreSeller"
        component={StoreSellerNavigator}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
  },
});