// src/shared/theme/colors.ts

export type AppColors = {
  bg: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  accent: string;
  danger: string;
  buttonText: string;
};

export function getColors(isDark: boolean): AppColors {
  if (isDark) {
    return {
      bg: "#000000",
      textPrimary: "#FFFFFF",
      textSecondary: "#B0B0B0",
      inputBg: "#111111",
      inputBorder: "#333333",
      inputText: "#FFFFFF",
      placeholder: "#777777",
      accent: "#1834ae",
      danger: "#ff4d4f",
      buttonText: "#FFFFFF",
    };
  }

  return {
    bg: "#67d9ea",
    textPrimary: "#000000",
    textSecondary: "#555555",
    inputBg: "#F5F5F5",
    inputBorder: "#DDDDDD",
    inputText: "#000000",
    placeholder: "#999999",
    accent: "#00bfff",
    danger: "#ff4d4f",
    buttonText: "#FFFFFF",
  };
}
