// src/domains/social/types/social.types.ts

export type SocialVisibility = "public" | "hidden";

export type SocialMediaType = "image" | "video";

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

export type SocialComment = {
  id: string;
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

export type SocialPost = {
  id: string;

  userId: string;
  username: string;
  userAvatarUri?: string | null;

  media: SocialMediaItem[]; // 🔒 her zaman array
  caption: string;

  music?: SocialMusicTrack | null;

  visibility: SocialVisibility;
  createdAt: string;

  likeCount: number;
  likedByMe: boolean;

  commentCount: number;
  commentsPreview?: SocialComment[];

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

  media: SocialMediaItem | null;
  mediaType?: SocialStoryMediaType;
  textNote?: string;
  caption?: string;

  music?: SocialMusicTrack | null;

  visibility: SocialVisibility;
  audience?: SocialStoryAudience;
  createdAt: string;
  expiresAt?: string;

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

export type SocialEventInviteStatus = "pending" | "accepted" | "rejected";

export type SocialEvent = {
  id: string;

  ownerUserId: string;

  title: string;
  description: string;
  dateISO: string;

  visibility: SocialVisibility;

  participantCount: number;
  joinedByMe: boolean;

  invites?: Array<{
    userId: string;
    username: string;
    status: SocialEventInviteStatus;
  }>;
};

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

export type SocialReportReason =
  | "spam"
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

  targetUserId: string;

  postId?: string;
  storyId?: string;
  eventId?: string;

  text: string;

  createdAt: string;

  read: boolean;
};