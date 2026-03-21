// src/domains/social/state/socialProfileStore.ts
// 🔒 SOCIAL PROFILE STORE (UI ONLY - LIVE UPDATE)
// UPDATED: Follow system support (ADIM 1)

export type SocialProfile = {
  userId: string;

  username: string;
  avatarUri: string | null;
  bio: string;

  coverUri: string | null;

  job: string;
  location: string;
  education: string;
  website: string;

  /* ------------------------------------------------ */
  /* FOLLOW SYSTEM                                    */
  /* ------------------------------------------------ */

  followerCount: number;
  followingCount: number;

  isFollowing: boolean;

  /* ------------------------------------------------ */
  /* PRIVACY / SECURITY (FAZ 5)                       */
  /* ------------------------------------------------ */

  privateAccount: boolean;
  allowMessageRequests: boolean;
  allowStoryReplies: boolean;
  hideOnlineStatus: boolean;
};

let profile: SocialProfile = {
  userId: "me",

  username: "Sosyal Kullanıcı",
  avatarUri: null,
  bio: "ConnectLine sosyal profil",

  coverUri: null,

  job: "",
  location: "",
  education: "",
  website: "",

  followerCount: 0,
  followingCount: 0,

  isFollowing: false,

  privateAccount: false,
  allowMessageRequests: true,
  allowStoryReplies: true,
  hideOnlineStatus: false,
};

type Listener = (p: SocialProfile) => void;

const listeners: Listener[] = [];

/* ------------------------------------------------ */
/* INTERNAL NOTIFY                                  */
/* ------------------------------------------------ */

function notify() {
  const snapshot = { ...profile };

  listeners.forEach((listener) => {
    listener(snapshot);
  });
}

/* ------------------------------------------------ */
/* STORE                                            */
/* ------------------------------------------------ */

export const socialProfileStore = {
  /* ------------------------------------------------ */
  /* GET PROFILE                                      */
  /* ------------------------------------------------ */

  getProfile(): SocialProfile {
    return { ...profile };
  },

  /* ------------------------------------------------ */
  /* UPDATE PROFILE                                   */
  /* ------------------------------------------------ */

  updateProfile(next: Partial<SocialProfile>) {
    profile = { ...profile, ...next };
    notify();
  },

  /* ------------------------------------------------ */
  /* PROFILE FIELD SETTERS                            */
  /* ------------------------------------------------ */

  setAvatar(uri: string | null) {
    profile = { ...profile, avatarUri: uri };
    notify();
  },

  setCover(uri: string | null) {
    profile = { ...profile, coverUri: uri };
    notify();
  },

  setName(name: string) {
    profile = { ...profile, username: name };
    notify();
  },

  setBio(bio: string) {
    profile = { ...profile, bio };
    notify();
  },

  setJob(job: string) {
    profile = { ...profile, job };
    notify();
  },

  setLocation(location: string) {
    profile = { ...profile, location };
    notify();
  },

  setEducation(education: string) {
    profile = { ...profile, education };
    notify();
  },

  setWebsite(website: string) {
    profile = { ...profile, website };
    notify();
  },

  /* ------------------------------------------------ */
  /* FOLLOW SYSTEM                                    */
  /* ------------------------------------------------ */

  follow() {
    if (!profile.isFollowing) {
      profile = {
        ...profile,
        isFollowing: true,
        followerCount: profile.followerCount + 1,
      };
      notify();
    }
  },

  unfollow() {
    if (profile.isFollowing) {
      profile = {
        ...profile,
        isFollowing: false,
        followerCount: Math.max(0, profile.followerCount - 1),
      };
      notify();
    }
  },

  setFollowerCount(count: number) {
    profile = {
      ...profile,
      followerCount: count,
    };
    notify();
  },

  setFollowingCount(count: number) {
    profile = {
      ...profile,
      followingCount: count,
    };
    notify();
  },

  /* ------------------------------------------------ */
  /* PRIVACY / SECURITY                               */
  /* ------------------------------------------------ */

  setPrivateAccount(value: boolean) {
    profile = { ...profile, privateAccount: value };
    notify();
  },

  setAllowMessageRequests(value: boolean) {
    profile = { ...profile, allowMessageRequests: value };
    notify();
  },

  setAllowStoryReplies(value: boolean) {
    profile = { ...profile, allowStoryReplies: value };
    notify();
  },

  setHideOnlineStatus(value: boolean) {
    profile = { ...profile, hideOnlineStatus: value };
    notify();
  },

  /* ------------------------------------------------ */
  /* SUBSCRIBE                                        */
  /* ------------------------------------------------ */

  subscribe(listener: Listener) {
    if (!listeners.includes(listener)) {
      listeners.push(listener);
    }

    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  },
};

/* ------------------------------------------------ */
/* NAMED EXPORT HELPERS (TEK KAYNAK)               */
/* ------------------------------------------------ */

export function updateProfile(patch: Partial<SocialProfile>) {
  profile = { ...profile, ...patch };
  notify();
}

export function subscribeProfile(listener: Listener) {
  return socialProfileStore.subscribe(listener);
}