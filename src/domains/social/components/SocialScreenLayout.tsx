// src/domains/social/components/SocialScreenLayout.tsx
// 🔒 SOCIAL SCREEN LAYOUT – FINAL
// SafeArea + Header + Scroll uyumlu
// Header gradient SocialHeader içinde uygulanır
// Header üst menüye 0 boşluk ile hizalanır

import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialHeader from "./SocialHeader";

type Props = {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  scroll?: boolean;
  right?: ReactNode;
};

export default function SocialScreenLayout({
  title,
  children,
  showBack = true,
  scroll = true,
  right,
}: Props) {
  const T = useAppTheme();

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: T.backgroundColor,
        },
      ]}
      edges={["left", "right"]}
    >
      {/* HEADER */}
      <SocialHeader title={title} showBack={showBack} right={right} />

      {/* CONTENT */}
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.contentFill]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  /** scroll={false} ekranlarda FlatList vb. için dikey alan */
  contentFill: {
    flex: 1,
    minHeight: 0,
  },
});