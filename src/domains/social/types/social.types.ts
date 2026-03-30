// src/domains/social/types/social.types.ts

export type SocialVisibility = "public" | "hidden" | "followers" | "private";

export type SocialMediaType = "image" | "video";
export type EventTimeString = `${number}:${number}`; // HH:mm
export type EventDateString = `${number}-${number}-${number}`; // YYYY-MM-DD

/* -------------------------------------------------------------------------- */
/* MUSIC                                                                      */
/* -------------------------------------------------------------------------- */

export type SocialMusicTrack = {
  id: string;
  title: string;
  artist?: string;
  durationSec: number; // 🔒 min 20 sn kuralı servis tarafında kontrol edilir
};

/* -------------------------------------------------------------------------- */
/* MEDIA                                                                      */
/* -------------------------------------------------------------------------- */

export type SocialMediaItem = {
  id: string;
  type: SocialMediaType;
  uri: string;
  durationSec?: number; // video için opsiyonel
};

/* -------------------------------------------------------------------------- */
/* COMMENTS                                                                   */
/* -------------------------------------------------------------------------- */

/** Gönderi yorumu (FAZ 5 — tek kaynak: feed state + socialCommentService) */
export type SocialComment = {
  id: string;
  postId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  likedByMe?: boolean;
  likeCount?: number;
};

/* -------------------------------------------------------------------------- */
/* POSTS                                                                      */
/* -------------------------------------------------------------------------- */

/** Paylaşım oluştur ekranından gelen görünürlük / etkileşim tercihleri */
export type SocialPostShareSettings = {
  /** Legacy; `commentsEnabled` ile birlikte kullanılır */
  comments?: boolean;
  likesVisible?: boolean;
  commentsEnabled?: boolean;
};

export type SocialPost = {
  id: string;

  userId: string;
  username: string;
  userAvatarUri?: string | null;
  /** Onaylı hesap rozeti (Reels / profil) */
  verified?: boolean;

  media: SocialMediaItem[]; // 🔒 her zaman array
  /** Kapak görseli bu indeksteki medyadır (yoksa 0) */
  coverIndex?: number;
  caption: string;

  music?: SocialMusicTrack | null;

  visibility: SocialVisibility;
  createdAt: string;

  /** Toplam beğeni sayısı (servis: `toggleLike` / `toggleLikePost`) */
  likeCount?: number;
  /** Mevcut kullanıcı bu gönderiyi beğendi mi */
  likedByMe?: boolean;

  commentCount: number;
  commentsPreview?: SocialComment[];

  /** Yorum / beğeni sayısı görünürlüğü (yoksa varsayılan: açık) */
  settings?: SocialPostShareSettings;
  commentsDisabled?: boolean;
  likeCountHidden?: boolean;

  /** Video küçük resim kapağı: medya id → saniye (şimdilik 0 = başlangıç) */
  videoCovers?: Record<string, number>;

  overlays?: Array<{
    id: string;
    type: "text" | "tag";
    x: number; // 0-1 (relative)
    y: number; // 0-1
    value: string;
    style?: {
      color?: string;
      fontSize?: number;
      fontWeight?: string;
    };
  }>;

  /** true ise feed / profil listelerinde gizlenir; mağazada kalır */
  archived?: boolean;

  /** Açıklamadan çıkarılmış @mention kullanıcı adları (önbellek) */
  mentions?: string[];

  /** Açıklamadan çıkarılmış #etiketler (önbellek) */
  hashtags?: string[];

  /* ---------------------------------------------------------------------- */
  /* EVENT FEED CARD SUPPORT (NEW)                                          */
  /* ---------------------------------------------------------------------- */

  /**
   * Feed içinde Event Card gösterimi
   * Normal post ise undefined olur
   */
  event?: {
    eventId: string;
    title: string;
    dateISO: string;
    location?: string;
    coverImage?: string;
  };
};

/* -------------------------------------------------------------------------- */
/* STORIES                                                                    */
/* -------------------------------------------------------------------------- */

/** Story media type for filtering */
export type SocialStoryMediaType = "photo" | "video" | "text";

/** Audience for story visibility */
export type SocialStoryAudience = "public" | "followers" | "private";

export type SocialStory = {
  id: string;

  userId: string;
  username: string;
  userAvatarUri?: string | null;

  media?: SocialMediaItem | null;
  /** Lightweight story service compatibility */
  mediaUri?: string;
  /** Lightweight story text compatibility */
  text?: string;
  mediaType?: SocialStoryMediaType;
  textNote?: string;
  caption?: string;

  music?: SocialMusicTrack | null;

  visibility: SocialVisibility;
  audience?: SocialStoryAudience;
  createdAt: string | number;
  expiresAt?: string;

  // Event deeplink for story shares
  eventId?: string;

  /** Event reference for event story */
  eventRef?: {
    eventId: string;
    title: string;
    dateISO: string;
    location?: string;
  };

  /** Tam ekran editor (tek metin katmanı) */
  overlays?:
    | {
        text: string;
        x: number;
        y: number;
        scale: number;
        color: string;
      }
    | {
        texts: { id: number; text: string; x: number; y: number }[];
        emojis: { id: number; emoji: string; x: number; y: number }[];
      };
};

/* -------------------------------------------------------------------------- */
/* EVENTS                                                                     */
/* -------------------------------------------------------------------------- */

export type SocialEventRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "PENDING"
  | "REJECTED"
  | "BANNED";

export interface SocialEventParticipant {
  userId: string;
  role: SocialEventRole;
}

export interface SocialEvent {
  id: string;
  title: string;
  createdBy: string;
  participants: SocialEventParticipant[];
  createdAt: number;
}

/* -------------------------------------------------------------------------- */
/* FOLLOW SYSTEM (ADIM 1 – NEW TYPES)                                        */
/* -------------------------------------------------------------------------- */

export type SocialFollowRelation = {
  followerUserId: string;
  followingUserId: string;
  createdAt: string;
};

export type SocialFollowStats = {
  followerCount: number;
  followingCount: number;
};

export type SocialFollowState = {
  isFollowing: boolean;
  isFollower: boolean;
};

export type SocialProfileFollowInfo = {
  userId: string;

  followerCount: number;
  followingCount: number;

  isFollowing: boolean;
};

export type SocialFollowAction =
  | "follow"
  | "unfollow";

/* -------------------------------------------------------------------------- */
/* NOTIFICATIONS (ADIM S7)                                                    */
/* -------------------------------------------------------------------------- */

export type SocialNotificationType =
  | "follow"
  | "follow_request"
  | "like"
  | "comment"
  | "share"
  | "story_reply"
  | "story_reaction"
  | "event_invite";

/* -------------------------------------------------------------------------- */
/* REPORT (FAZ 2)                                                             */
/* -------------------------------------------------------------------------- */

/** Gönderi / kullanıcı bildirimi (FAZ 5 — ADIM 5 + geriye dönük değerler) */
export type SocialReportReason =
  | "spam"
  | "rahatsiz_edici"
  | "uygunsuz"
  | "sahte_hesap"
  | "diger"
  | "fake_account"
  | "abuse"
  | "violence"
  | "other";

export type SocialReportTarget = "user" | "post";

export type SocialNotification = {
  id: string;

  type: SocialNotificationType;

  actorUserId: string;
  actorUsername: string;
  actorAvatarUri?: string | null;

  /** Bildirimin hedef kullanıcısı (ör. gönderi sahibi, takip edilen) */
  targetUserId: string;

  /** Gönderiyle ilişkili bildirimler */
  postId?: string;
  /** `postId` ile aynı anlam (ADIM 4 uyumluluğu) */
  targetPostId?: string;
  storyId?: string;
  eventId?: string;

  text: string;

  createdAt: string;

  read: boolean;
};