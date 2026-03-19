import { useAppTheme as useThemeContext } from "../../shared/theme/appTheme";

/**
 * SocialCreateStory vb. için düz `colors` + `isDark` (global AppTheme ile uyumlu).
 */
export function useAppTheme() {
  const T = useThemeContext();

  return {
    isDark: T.isDark,
    colors: {
      background: T.backgroundColor,
      text: T.textColor,
      muted: T.mutedText,
      surface: T.cardBg,
      surfaceElevated: T.inputBackground,
      primary: T.primary,
      accent: T.accent,
      border: T.border,
      onPrimary: "#ffffff",
      /** Medya seç satırı */
      mediaPickBg: T.inputBackground,
      /** Önizleme kutusu (video placeholder arkası) */
      previewBg: T.isDark ? T.inputBackground : T.backgroundColor,
      paylasDisabled: T.isDark ? "#333333" : "#cccccc",
    },
  };
}
