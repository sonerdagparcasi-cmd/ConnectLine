// src/core/navigation/AuthNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../../screens/auth/LoginScreen";
import OtpVerificationScreen from "../../screens/auth/OtpVerificationScreen";
import RegisterScreen from "../../screens/auth/RegisterScreen";

import {
  shouldRequireOtp
} from "../../shared/auth/authSession";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OtpVerification: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AUTH FLOW (GÜNCEL – KİLİTLİ)
 *
 * Register → Login
 * Login → OTP → Core
 */
export default function AuthNavigator({
  onAuthSuccess,
}: {
  onAuthSuccess: () => void;
}) {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* ---------------- LOGIN ---------------- */}
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onRegisterPress={() =>
              props.navigation.navigate("Register")
            }
            onForgotPress={() => {
              // Forgot Password ileride
            }}
            onLoginSuccess={() => {
              /**
               * LoginScreen → startLoginSession çağırır
               * OTP sadece login sonrası
               */
              if (shouldRequireOtp()) {
                props.navigation.replace("OtpVerification");
              } else {
                onAuthSuccess();
              }
            }}
          />
        )}
      </Stack.Screen>

      {/* ---------------- REGISTER ---------------- */}
      <Stack.Screen name="Register">
        {(props) => (
          <RegisterScreen
            {...props}
            onRegisterSuccess={() => {
              /**
               * ✅ KAYIT TAMAMLANDI
               * - Session BAŞLATILMAZ
               * - OTP YOK
               * - Login ekranına dönülür
               */
              props.navigation.replace("Login");
            }}
          />
        )}
      </Stack.Screen>

      {/* ---------------- OTP ---------------- */}
      <Stack.Screen name="OtpVerification">
        {(props) => (
          <OtpVerificationScreen
            {...props}
            onOtpSuccess={() => {
              /**
               * OTP sadece LOGIN sonrası
               */
              onAuthSuccess();
            }}
            onResendCode={() => {
              // SMS resend ileride
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
