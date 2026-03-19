import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { startLoginSession } from "../../shared/auth/authSession";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type LoginScreenProps = {
  onLoginSuccess?: () => void;
  onRegisterPress?: () => void;
  onForgotPress?: () => void;
  initialPhone?: string;
  initialEmail?: string;
};

/* -------------------------------------------------------------------------- */
/* SCREEN                                                                     */
/* -------------------------------------------------------------------------- */

export default function LoginScreen({
  onLoginSuccess,
  onRegisterPress,
  onForgotPress,
  initialPhone,
  initialEmail,
}: LoginScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  function handleLogin() {
    startLoginSession({ phone });
    onLoginSuccess?.();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* LOGO */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/C-Line.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* WELCOME */}
          <Text style={styles.welcome}>HOŞGELDİNİZ...</Text>

          {/* INPUTS */}
          <Input
            icon="person"
            placeholder="Ad Soyad"
            value={name}
            onChangeText={setName}
          />

          <Input
            icon="mail"
            placeholder="E-Mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            icon="call"
            placeholder="Telefon Numarası girin"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            icon="lock-closed"
            placeholder="Şifre  ******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            right={
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons
                  name={secure ? "eye-off" : "eye"}
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>
            }
          />

          {/* LINKS */}
          <View style={styles.links}>
            <TouchableOpacity onPress={onRegisterPress}>
              <Text style={styles.link}>Kayıt Ol</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onForgotPress}>
              <Text style={styles.linkDanger}>Şifremi Unuttum</Text>
            </TouchableOpacity>
          </View>

          {/* BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

function Input({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={18} color="#ffffff" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#cfd6ff"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {right}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#000000" },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  logoWrap: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "85%",
    height: "85%",
  },

  welcome: {
    textAlign: "center",
    color: "#bfc2c9",
    letterSpacing: 3,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 24,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1f3fae",
    height: 46,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
  },

  links: {
    marginTop: 6,
    gap: 6,
  },
  link: {
    color: "#cfd6ff",
    fontSize: 13,
  },
  linkDanger: {
    color: "#ff4d4d",
    fontSize: 13,
  },

  button: {
    marginTop: 30,
    alignSelf: "center",
    backgroundColor: "#1f3fae",
    width: 180,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
