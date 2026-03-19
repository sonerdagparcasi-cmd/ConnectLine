import { ReactNode, createContext, useContext } from "react";

type AppThemeValue = {
  isDark: boolean;
  backgroundColor: string;
  textColor: string;
  accent: string;
  mutedText: string;
  cardBg: string;
  border: string;
  /** Arka plan (genelde backgroundColor ile aynı) */
  background: string;
  /** Kart / balon arka planı (genelde cardBg ile aynı) */
  card: string;
  inputBackground: string;
  primary: string;
  lightGradient: { colors: readonly [string, string] };
  darkGradient: { colors: readonly [string, string] };
};

const AppThemeContext = createContext<AppThemeValue | null>(null);

export function AppThemeProvider({
  value,
  children,
}: {
  value: AppThemeValue;
  children: ReactNode;
}) {
  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    // AppShell dışında kullanılmasın
    return {
      isDark: true,
      backgroundColor: "#000000",
      textColor: "#ffffff",
      accent: "#1f41ff",
      mutedText: "rgba(255,255,255,0.7)",
      cardBg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.18)",
      background: "#000000",
      card: "rgba(255,255,255,0.06)",
      inputBackground: "#111111",
      primary: "#1f41ff",
      lightGradient: { colors: ["#ffffff", "#00bfff"] as const },
      darkGradient: { colors: ["#000000", "#1834ae"] as const },
    } as const;
  }
  return ctx;
}
