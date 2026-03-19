// src/domains/chat/providers/ChatThemeProvider.tsx
// Chat domain uses the global theme system (useAppTheme from parent AppThemeProvider).
// Pass-through so no local theme override; chat stack inherits app theme.

import { useAppTheme } from "../../../shared/theme/appTheme";

export function ChatThemeProvider({ children }: { children: React.ReactNode }) {
  useAppTheme();
  return <>{children}</>;
}
