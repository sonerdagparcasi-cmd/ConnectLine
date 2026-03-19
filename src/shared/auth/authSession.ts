/**
 * AUTH SESSION – UI ONLY (BACKEND READY)
 *
 * Kimlik: Telefon numarası
 * OTP: Cihaz bazlı, logout olana kadar 1 kez
 *
 * Bu dosya:
 * - Şu an LOCAL / UI-only çalışır
 * - Firebase / backend geldiğinde birebir eşleşir
 * - Ekranlardan ve navigatordan BAĞIMSIZDIR
 */

export type AuthSessionState = {
  isAuthenticated: boolean;
  otpVerified: boolean;
  phone: string | null;
  userId: string | null; // backend-ready (Firebase UID vb.)
  source: "login" | "register" | null; // akış kaynağı
};

/**
 * 🔒 In-memory session
 * (ileride SecureStore / AsyncStorage / Firebase token ile değiştirilebilir)
 */
let session: AuthSessionState = {
  isAuthenticated: false,
  otpVerified: false,
  phone: null,
  userId: null,
  source: null,
};

/* -------------------------------------------------------------------------- */
/* SESSION READERS                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Aktif bir oturum var mı?
 * (Uygulama kapatılmadığı sürece)
 */
export function hasActiveSession(): boolean {
  return session.isAuthenticated;
}

/**
 * OTP bu oturumda doğrulandı mı?
 */
export function isOtpVerified(): boolean {
  return session.otpVerified;
}

/**
 * Mevcut telefon (kimlik)
 */
export function getSessionPhone(): string | null {
  return session.phone;
}

/**
 * Backend userId (ileride Firebase UID)
 */
export function getSessionUserId(): string | null {
  return session.userId;
}

/**
 * Akış nereden geldi? (login / register)
 */
export function getSessionSource(): AuthSessionState["source"] {
  return session.source;
}

/**
 * RootNavigator için tek giriş noktası
 * → Auth mı Core mu?
 */
export function restoreSession(): AuthSessionState {
  return { ...session };
}

/* -------------------------------------------------------------------------- */
/* SESSION MUTATIONS                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Login sonrası çağrılır
 * OTP henüz doğrulanmamış kabul edilir
 */
export function startLoginSession(params: {
  phone: string;
  userId?: string;
}) {
  session = {
    isAuthenticated: true,
    otpVerified: false,
    phone: params.phone,
    userId: params.userId ?? null,
    source: "login",
  };
}

/**
 * Register sonrası çağrılır
 * → Login ekranına dönülmez
 * → Direkt OTP akışı başlar
 */
export function startRegisterSession(params: {
  phone: string;
  userId?: string;
}) {
  session = {
    isAuthenticated: true,
    otpVerified: false,
    phone: params.phone,
    userId: params.userId ?? null,
    source: "register",
  };
}

/**
 * OTP doğrulama başarılı olduğunda çağrılır
 */
export function markOtpVerified() {
  if (!session.isAuthenticated) return;

  session = {
    ...session,
    otpVerified: true,
  };
}

/**
 * Logout
 * → OTP tekrar zorunlu hale gelir
 * → RootNavigator otomatik Auth’a düşer
 */
export function clearSession() {
  session = {
    isAuthenticated: false,
    otpVerified: false,
    phone: null,
    userId: null,
    source: null,
  };
}

/* -------------------------------------------------------------------------- */
/* FLOW HELPERS (NAVIGATION KARARI İÇİN)                                       */
/* -------------------------------------------------------------------------- */

/**
 * OTP gerekli mi?
 *
 * Kurallar (global standart):
 * - Login sonrası → EVET
 * - Register sonrası → EVET
 * - Aynı oturumda doğrulanmışsa → HAYIR
 */
export function shouldRequireOtp(): boolean {
  if (!session.isAuthenticated) return true;
  if (!session.otpVerified) return true;
  return false;
}

/**
 * OTP doğrulandıktan sonra
 * → Core alanına geçilebilir mi?
 */
export function canEnterCore(): boolean {
  return session.isAuthenticated && session.otpVerified;
}

/**
 * Forgot password sonrası
 * → Login + OTP zorunlu
 */
export function afterPasswordReset() {
  clearSession();
}

/* -------------------------------------------------------------------------- */
/* DEBUG / DEV (ileride kaldırılabilir)                                        */
/* -------------------------------------------------------------------------- */

export function __getSessionSnapshot(): AuthSessionState {
  return { ...session };
}
