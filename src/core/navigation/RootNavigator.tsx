// src/core/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";

import { restoreSession } from "../../shared/auth/authSession";
import AuthNavigator from "./AuthNavigator";
import CoreNavigator from "./CoreNavigator";



/**
 * RootNavigator (LOCKED)
 * ------------------------------------------------------------------
 * 🔐 Uygulamanın TEK giriş noktasıdır
 *
 * - Auth ↔ Core kararını verir
 * - Session durumunu okur
 * - Logout sonrası otomatik Auth’a düşürür 
 *
 * ⚠️ Bu dosya KİLİTLİDİR
 */

export type RootStackParamList = {
  Auth: undefined;
  Core: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = restoreSession();

    setIsAuthenticated(
      session.isAuthenticated && session.otpVerified
    );

    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth">
          {() => (
            <AuthNavigator
              onAuthSuccess={() =>
                setIsAuthenticated(true)
              }
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Core">
          {() => (
            <CoreNavigator
              onLogout={() =>
                setIsAuthenticated(false)
              }
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
