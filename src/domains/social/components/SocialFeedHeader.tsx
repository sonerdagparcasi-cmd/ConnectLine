import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { SocialStory } from "../types/social.types";
import SocialStoriesRail from "./SocialStoriesRail";

type Props = {
  stories: SocialStory[];
  onOpenStory: (userId: string) => void;
};

export default function SocialFeedHeader({ stories, onOpenStory }: Props) {
  const T = useAppTheme();

  const colors: [string, string] = T.isDark
    ? ["#000000", "#1834ae"]
    : ["#ffffff", "#00bfff"];

  return (
    <LinearGradient colors={colors} style={styles.wrap}>
      <SocialStoriesRail
        stories={stories}
        onOpenStory={onOpenStory}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 12,
  },
});