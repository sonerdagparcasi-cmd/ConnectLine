import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ChatProfile } from "./chatProfile.types";

const STORAGE_KEY = "chat_profile";

let SecureStore: {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
} | null = null;

(async () => {
  try {
    SecureStore = await import("expo-secure-store");
  } catch {
    SecureStore = null;
  }
})();

type UpdateProfilePayload = {
  displayName?: string;
  avatarUri?: string;
  phone?: string;
  email?: string;
  bio?: string;
};

type ChatProfileContextValue = {
  profile: ChatProfile;
  updateProfile: (payload: UpdateProfilePayload) => void;
};

const ChatProfileContext =
  createContext<ChatProfileContextValue | undefined>(undefined);

export function ChatProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<ChatProfile>({
    displayName: "Ben",
    avatarUri: undefined,
    phone: undefined,
    email: undefined,
    bio: undefined,
  });

  /* LOAD */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!SecureStore) return;
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw && mounted) {
          setProfile(JSON.parse(raw));
        }
      } catch {}
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* SAVE */
  async function persist(next: ChatProfile) {
    setProfile(next);
    try {
      if (!SecureStore) return;
      await SecureStore.setItemAsync(
        STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {}
  }

  function updateProfile(payload: UpdateProfilePayload) {
    persist({
      ...profile,
      ...payload,
      updatedAt: Date.now(),
    });
  }

  return (
    <ChatProfileContext.Provider
      value={{ profile, updateProfile }}
    >
      {children}
    </ChatProfileContext.Provider>
  );
}

export function useChatProfile(): ChatProfileContextValue {
  const ctx = useContext(ChatProfileContext);
  if (!ctx) {
    throw new Error(
      "useChatProfile must be used within ChatProfileProvider"
    );
  }
  return ctx;
}