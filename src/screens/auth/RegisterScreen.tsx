// src/screens/auth/RegisterScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { t } from "../../shared/i18n/t";
import { getColors } from "../../shared/theme/colors";

type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string; // E.164-like
  country: string;
  city: string;
  password: string;
};

type Props = {
  onRegisterSuccess?: (payload: RegisterPayload) => void;
};

/* -------------------------------------------------------------------------- */
/* MOCK DATA (SIMULATOR FRIENDLY)                                              */
/* -------------------------------------------------------------------------- */

type CountryData = {
  country: string;
  code: string; // phone code
  cities: string[];
};

const COUNTRY_DATA: CountryData[] = [
  {
    country: "Türkiye",
    code: "+90",
    cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"],
  },
  {
    country: "Almanya",
    code: "+49",
    cities: ["Berlin", "Münih", "Hamburg", "Köln", "Frankfurt"],
  },
  {
    country: "Birleşik Krallık",
    code: "+44",
    cities: ["Londra", "Manchester", "Birmingham", "Liverpool", "Leeds"],
  },
  {
    country: "ABD",
    code: "+1",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
  },
  {
    country: "Fransa",
    code: "+33",
    cities: ["Paris", "Lyon", "Marsilya", "Nice", "Toulouse"],
  },
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function isEmailLike(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim().toLowerCase());
}

function normalizeDigits(v: string) {
  return (v || "").replace(/[^\d]/g, "");
}

function buildE164(phoneCode: string, rawPhone: string) {
  const digits = normalizeDigits(rawPhone);
  return `${phoneCode}${digits}`;
}

function isE164Like(full: string) {
  return /^\+\d{10,15}$/.test(full);
}

function hasLetter(v: string) {
  return /[A-Za-z]/.test(v);
}

function hasNumber(v: string) {
  return /\d/.test(v);
}

/* -------------------------------------------------------------------------- */

export default function RegisterScreen({ onRegisterSuccess }: Props) {
  const isDark = useColorScheme() === "dark";
  const _C = useMemo(() => getColors(isDark), [isDark]); // global tema korunur
  const videoRef = useRef<Video>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [country, setCountry] = useState("Ülke");
  const [city, setCity] = useState("Şehir");
  const [phoneCode, setPhoneCode] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [secure, setSecure] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const [countryModal, setCountryModal] = useState(false);
  const [cityModal, setCityModal] = useState(false);

  const selectedCountry = COUNTRY_DATA.find(
    (c) => c.country === country
  );

  /* ---------------- VALIDATIONS ---------------- */

  const emailOk = email.length > 0 && isEmailLike(email);

  const fullPhone = buildE164(phoneCode, phone);
  const phoneOk = phone.length > 0 && isE164Like(fullPhone);

  const pwdMinOk = password.length >= 8;
  const pwdLetterOk = hasLetter(password);
  const pwdNumberOk = hasNumber(password);
  const pwdOk = pwdMinOk && pwdLetterOk && pwdNumberOk;
  const pwdMatchOk = password2.length > 0 && password === password2;

  const countryOk = country !== "Ülke";
  const cityOk = city !== "Şehir";

  const canSubmit =
    fullName.trim().length > 0 &&
    emailOk &&
    phoneOk &&
    countryOk &&
    cityOk &&
    pwdOk &&
    pwdMatchOk &&
    accepted;

  /* ---------------- WARNINGS ---------------- */

  const showEmailWarn = email.length > 0 && !emailOk;
  const showPhoneWarn = phone.length > 0 && !phoneOk;
  const showPwdWarn = password.length > 0 && !pwdOk;
  const showPwdMatchWarn = password2.length > 0 && !pwdMatchOk;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ---------------- VIDEO ---------------- */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={require("../../assets/videos/world.mp4")}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          isMuted
          shouldPlay
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.welcome}>{t("welcome")}</Text>
          <Text style={styles.sub}>Kayıt Ol...</Text>

          <Field
            icon="person"
            placeholder="Ad Soyad"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* ---------------- COUNTRY / CITY ---------------- */}
          <View style={styles.row}>
            <Select
              icon="earth"
              value={country}
              onPress={() => setCountryModal(true)}
            />
            <Select
              icon="business"
              value={city}
              disabled={!countryOk}
              onPress={() => setCityModal(true)}
            />
          </View>

          <Field
            icon="mail"
            placeholder="E-Mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {showEmailWarn && (
            <Text style={styles.warn}>E-mail formatı geçersiz.</Text>
          )}

          {/* ---------------- PHONE ---------------- */}
          <View style={styles.inputRow}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.code}>{phoneCode || "+__"}</Text>
            <TextInput
              style={styles.input}
              placeholder="Telefon"
              placeholderTextColor="#bfc7d5"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => setPhone(normalizeDigits(v))}
              maxLength={15}
            />
          </View>
          {showPhoneWarn && (
            <Text style={styles.warn}>
              Telefon numarası geçersiz.
            </Text>
          )}

          {/* ---------------- PASSWORD ---------------- */}
          <Field
            icon="lock-closed"
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            right={
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Text style={styles.toggle}>
                  {secure ? "Göster" : "Gizle"}
                </Text>
              </TouchableOpacity>
            }
          />

          {showPwdWarn && (
            <View style={{ marginTop: -6, marginBottom: 10 }}>
              {!pwdMinOk && (
                <Text style={styles.warn}>
                  Şifre en az 8 karakter olmalı.
                </Text>
              )}
              {pwdMinOk && !pwdLetterOk && (
                <Text style={styles.warn}>
                  En az 1 harf içermeli.
                </Text>
              )}
              {pwdMinOk && pwdLetterOk && !pwdNumberOk && (
                <Text style={styles.warn}>
                  En az 1 rakam içermeli.
                </Text>
              )}
            </View>
          )}

          <Field
            icon="lock-closed"
            placeholder="Şifre Tekrar"
            value={password2}
            onChangeText={setPassword2}
            secureTextEntry={secure}
          />
          {showPwdMatchWarn && (
            <Text style={styles.warn}>Şifreler eşleşmiyor.</Text>
          )}

          {/* ---------------- KVKK ---------------- */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAccepted(!accepted)}
          >
            <Ionicons
              name={accepted ? "checkbox" : "square-outline"}
              size={20}
              color={accepted ? "#4da3ff" : "#aaa"}
            />
            <Text style={styles.checkText}>
              Gizlilik, Şartlar ve Koşullar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canSubmit}
            style={[styles.button, !canSubmit && { opacity: 0.4 }]}
            onPress={() =>
              onRegisterSuccess?.({
                fullName: fullName.trim(),
                email: email.trim(),
                phone: fullPhone,
                country,
                city,
                password,
              })
            }
          >
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------------- COUNTRY MODAL ---------------- */}
      <PickerModal
        visible={countryModal}
        title="Ülke Seç"
        items={COUNTRY_DATA.map((c) => c.country)}
        onClose={() => setCountryModal(false)}
        onSelect={(val) => {
          const c = COUNTRY_DATA.find((x) => x.country === val);
          setCountry(val);
          setCity("Şehir");
          setPhoneCode(c?.code ?? "");
          setCountryModal(false);
        }}
      />

      {/* ---------------- CITY MODAL ---------------- */}
      <PickerModal
        visible={cityModal}
        title="Şehir Seç"
        items={selectedCountry?.cities ?? []}
        onClose={() => setCityModal(false)}
        onSelect={(val) => {
          setCity(val);
          setCityModal(false);
        }}
        emptyText={!countryOk ? "Önce ülke seçmelisin." : "Şehir listesi yok."}
      />
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

function Field({ icon, right, ...props }: any) {
  return (
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={18} color="#fff" />
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#bfc7d5"
      />
      {right}
    </View>
  );
}

function Select({
  icon,
  value,
  disabled,
  onPress,
}: {
  icon: any;
  value: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.select, disabled && { opacity: 0.45 }]}
    >
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={styles.selectText}>{value}</Text>
      <Ionicons name="chevron-down" size={18} color="#cfe2ff" />
    </TouchableOpacity>
  );
}

function PickerModal({
  visible,
  title,
  items,
  onClose,
  onSelect,
  emptyText,
}: {
  visible: boolean;
  title: string;
  items: string[];
  onClose: () => void;
  onSelect: (v: string) => void;
  emptyText?: string;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {items.length === 0 ? (
              <Text style={styles.modalEmpty}>
                {emptyText ?? "Liste boş."}
              </Text>
            ) : (
              items.map((it) => (
                <TouchableOpacity
                  key={it}
                  style={styles.modalItem}
                  onPress={() => onSelect(it)}
                >
                  <Text style={styles.modalItemText}>{it}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#cfe2ff"
                  />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  videoContainer: { height: 200 },
  video: { width: "100%", height: "100%" },
  container: { padding: 20, paddingBottom: 30 },

  welcome: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: 10,
  },
  sub: { textAlign: "center", color: "#aaa", marginVertical: 10 },

  row: { flexDirection: "row", gap: 10, marginBottom: 12 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#1f3fa8",
    marginBottom: 12,
  },
  input: { flex: 1, color: "#fff" },

  select: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#1f3fa8",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: "#fff" },

  code: { color: "#fff" },
  toggle: { color: "#cfe2ff", fontSize: 12 },

  checkRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  checkText: { color: "#aaa", fontSize: 13 },

  warn: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
  },

  button: {
    marginTop: 14,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2f6bff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#0b1220",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
    marginBottom: 8,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  modalItem: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#152a6a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalItemText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalEmpty: {
    color: "#c7cede",
    paddingVertical: 20,
    textAlign: "center",
  },
});
