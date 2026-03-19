// src/screens/auth/OtpVerificationScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { getSessionPhone, markOtpVerified } from "../../shared/auth/authSession";
import { getColors } from "../../shared/theme/colors";

type Props = {
  onOtpSuccess?: () => void;
  onResendCode?: () => void;
};

/**
 * OtpVerificationScreen
 *
 * - UI-only (SIMULATOR READY)
 * - OTP: 123456
 * - Süre: 120 sn
 * - 3 hatalı deneme → 5 dk kilit
 * - authSession ile uyumlu
 * - Navigation kararı DIŞARIDAN
 */

const OTP_CODE = "123456";
const OTP_TTL = 120; // seconds
const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 300; // 5 dk

export default function OtpVerificationScreen({ onOtpSuccess, onResendCode }: Props) {
  const isDark = useColorScheme() === "dark";
  const C = useMemo(() => getColors(isDark), [isDark]);

  const phone = getSessionPhone();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [lockedFor, setLockedFor] = useState<number | null>(null);

  // RN ortamında NodeJS.Timeout tipi yok; güvenli tip: ReturnType<typeof setInterval>
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isExpired = secondsLeft <= 0;
  const isLocked = lockedFor !== null && lockedFor > 0;

  const canSubmit = code.length === 6 && !isExpired && !isLocked && attemptsLeft > 0;

  /* -------------------------------------------------------------------------- */
  /* TIMERS                                                                     */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isLocked) return;

    lockTimerRef.current = setInterval(() => {
      setLockedFor((s) => (s && s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [isLocked]);

  /* -------------------------------------------------------------------------- */
  /* HANDLERS                                                                   */
  /* -------------------------------------------------------------------------- */

  function handleVerify() {
    if (isExpired) {
      setError("Kodun süresi doldu");
      return;
    }

    if (isLocked) {
      setError("Çok fazla deneme. Lütfen bekleyin.");
      return;
    }

    if (code !== OTP_CODE) {
      const left = attemptsLeft - 1;
      setAttemptsLeft(left);
      setError("Hatalı doğrulama kodu");

      if (left <= 0) {
        setLockedFor(LOCK_SECONDS);
        setError("Çok fazla deneme. 5 dakika kilitlendi.");
      }
      return;
    }

    // ✅ BAŞARILI OTP
    setError(null);
    markOtpVerified();
    onOtpSuccess?.();
  }

  function handleResend() {
    setCode("");
    setError(null);
    setAttemptsLeft(MAX_ATTEMPTS);
    setSecondsLeft(OTP_TTL);
    setLockedFor(null);
    onResendCode?.();
  }

  /* -------------------------------------------------------------------------- */

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark" size={56} color={C.accent} />
          </View>

          <Text style={[styles.title, { color: C.textPrimary }]}>SMS Doğrulama</Text>

          <Text style={[styles.desc, { color: C.textSecondary }]}>
            {phone
              ? `${phone} numarasına gönderilen 6 haneli kodu giriniz`
              : "Telefonunuza gönderilen 6 haneli kodu giriniz"}
          </Text>

          <View
            style={[
              styles.inputRow,
              { backgroundColor: C.inputBg, borderColor: C.inputBorder },
            ]}
          >
            <Ionicons name="keypad" size={20} color={C.textPrimary} />
            <TextInput
              style={[styles.input, { color: C.inputText }]}
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/[^0-9]/g, ""));
                if (error) setError(null);
              }}
              placeholder="______"
              placeholderTextColor={C.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />
          </View>

          {/* INFO */}
          {!isLocked && !isExpired && (
            <Text style={[styles.info, { color: C.textSecondary }]}>
              Kalan süre: {secondsLeft} sn • Kalan deneme: {attemptsLeft}
            </Text>
          )}

          {isExpired && (
            <Text style={[styles.error, { color: C.danger }]}>Kodun süresi doldu</Text>
          )}

          {isLocked && (
            <Text style={[styles.error, { color: C.danger }]}>
              Çok fazla deneme. {lockedFor} sn sonra tekrar deneyin.
            </Text>
          )}

          {error && !isLocked && !isExpired && (
            <Text style={[styles.error, { color: C.danger }]}>{error}</Text>
          )}

          <TouchableOpacity
            disabled={!canSubmit}
            style={[
              styles.button,
              {
                backgroundColor: canSubmit ? C.accent : "rgba(120,120,120,0.4)",
              },
            ]}
            onPress={handleVerify}
          >
            <Text style={[styles.buttonText, { color: C.buttonText }]}>Doğrula</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resend} onPress={handleResend} disabled={isLocked}>
            <Text
              style={[
                styles.resendText,
                { color: isLocked ? "rgba(150,150,150,0.6)" : C.textSecondary },
              ]}
            >
              Kodu tekrar gönder
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },

  container: { flex: 1, padding: 24, justifyContent: "center" },

  iconWrap: { alignItems: "center", marginBottom: 16 },

  title: { textAlign: "center", fontSize: 20, fontWeight: "800", marginBottom: 8 },

  desc: { textAlign: "center", fontSize: 14, marginBottom: 18 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },

  input: { flex: 1, fontSize: 20, letterSpacing: 10 },

  info: { textAlign: "center", fontSize: 12, marginBottom: 6 },

  error: { textAlign: "center", marginBottom: 8, fontSize: 13 },

  button: {
    marginTop: 10,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: { fontSize: 16, fontWeight: "800" },

  resend: { marginTop: 18, alignItems: "center" },

  resendText: { fontSize: 13, textDecorationLine: "underline" },
});