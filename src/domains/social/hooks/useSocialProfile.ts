// src/domains/social/hooks/useSocialProfile.ts

/**
 * 🔒 SOCIAL PROFILE ACCESS – TEK KARAR NOKTASI
 * UPDATED: Follow system integration (ADIM 1)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { socialProfileStore } from "../state/socialProfileStore";
import {
  getPostsByUser,
  subscribeFeed,
} from "../services/socialFeedStateService";
import { getFollowingCount, subscribeFollow } from "../services/socialFollowService";
import { socialEventService } from "../services/socialEventService";

/** TEST ONLY – fake user switch */
const TEST_USERS = [
  { userId: "u1", username: "Sen", avatarUri: null as string | null },
  { userId: "u2", username: "Ahmet", avatarUri: null as string | null },
];

let CURRENT_INDEX = 0;

export function switchTestUser() {
  CURRENT_INDEX = (CURRENT_INDEX + 1) % TEST_USERS.length;
}

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type ProfileState = {
  username: string;
  avatarUri: string | null;
  coverUri: string | null;

  bio: string;
  job?: string;
  location?: string;
  education?: string;
  website?: string;

  followerCount: number;
  followingCount: number;

  isFollowing: boolean;
};

/* ------------------------------------------------------------------ */
/* HOOK                                                               */
/* ------------------------------------------------------------------ */

export function useSocialProfile(profileUserId?: string) {
  const me = TEST_USERS[CURRENT_INDEX];
  const targetUserId = profileUserId ?? me.userId;

  /* ------------------------------------------------------------------ */
  /* PROFILE STATE                                                      */
  /* ------------------------------------------------------------------ */

  const [profileState, setProfileState] = useState<ProfileState>(() =>
    socialProfileStore.getProfile()
  );

  useEffect(() => {
    const unsubscribe = socialProfileStore.subscribe(setProfileState);
    return unsubscribe;
  }, []);

  /* ------------------------------------------------------------------ */
  /* ROLE                                                               */
  /* ------------------------------------------------------------------ */

  const isOwner = useMemo(() => {
    return targetUserId === me.userId;
  }, [targetUserId, me.userId]);

  /* ------------------------------------------------------------------ */
  /* PROFILE VIEW                                                       */
  /* ------------------------------------------------------------------ */

  const profile = useMemo(() => {
    if (profileUserId != null && profileUserId !== me.userId) {
      return {
        userId: targetUserId,
        username: profileState.username,
        avatarUri: profileState.avatarUri,
        coverUri: profileState.coverUri,
        bio: profileState.bio,
        job: profileState.job,
        location: profileState.location,
        education: profileState.education,
        website: profileState.website,
      };
    }
    return {
      ...me,
      coverUri: profileState.coverUri,
      bio: profileState.bio,
      job: profileState.job,
      location: profileState.location,
      education: profileState.education,
      website: profileState.website,
    };
  }, [profileUserId, me, targetUserId, profileState]);

  /* ------------------------------------------------------------------ */
  /* UPDATE PROFILE                                                     */
  /* ------------------------------------------------------------------ */

  function updateProfile(next: Partial<ProfileState>) {
    socialProfileStore.updateProfile(next);
  }

  /* ------------------------------------------------------------------ */
  /* POST COUNT (from feed state)                                        */
  /* ------------------------------------------------------------------ */

  const [postCount, setPostCount] = useState(() =>
    getPostsByUser(targetUserId).length
  );

  useEffect(() => {
    setPostCount(getPostsByUser(targetUserId).length);
    const unsub = subscribeFeed(() =>
      setPostCount(getPostsByUser(targetUserId).length)
    );
    return unsub;
  }, [targetUserId]);

  /* ------------------------------------------------------------------ */
  /* EVENTS COUNT (from event service)                                   */
  /* ------------------------------------------------------------------ */

  const [eventsCount, setEventsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    socialEventService.getEventsByUser(targetUserId).then((events) => {
      if (!cancelled) setEventsCount(events.length);
    });
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  /* ------------------------------------------------------------------ */
  /* FOLLOWING COUNT (from follow service for "me")                      */
  /* ------------------------------------------------------------------ */

  const [followingCount, setFollowingCount] = useState(() =>
    targetUserId === me.userId ? getFollowingCount() : 0
  );

  useEffect(() => {
    if (targetUserId !== me.userId) return;
    setFollowingCount(getFollowingCount());
    const unsub = subscribeFollow(() => setFollowingCount(getFollowingCount()));
    return unsub;
  }, [targetUserId, me.userId]);

  /* ------------------------------------------------------------------ */
  /* COUNTERS                                                           */
  /* ------------------------------------------------------------------ */

  const stats = useMemo(() => {
    const following =
      targetUserId === me.userId
        ? followingCount
        : profileState.followingCount;
    return {
      posts: postCount,
      followers: profileState.followerCount,
      following,
      events: eventsCount,
    };
  }, [profileState, postCount, eventsCount, followingCount, targetUserId, me.userId]);

  /* ------------------------------------------------------------------ */
  /* FOLLOW STATE                                                       */
  /* ------------------------------------------------------------------ */

  const followState = useMemo(() => {
    if (isOwner) {
      return {
        canFollow: false,
        isFollowing: false,
      };
    }

    return {
      canFollow: true,
      isFollowing: profileState.isFollowing,
    };
  }, [isOwner, profileState]);

  /* ------------------------------------------------------------------ */
  /* FOLLOW ACTIONS                                                     */
  /* ------------------------------------------------------------------ */

  const follow = useCallback(() => {
    socialProfileStore.follow();
  }, []);

  const unfollow = useCallback(() => {
    socialProfileStore.unfollow();
  }, []);

  /* ------------------------------------------------------------------ */
  /* OWNER / VISITOR ACTIONS (for profile screen)                        */
  /* ------------------------------------------------------------------ */

  const ownerActions = useMemo(
    () => [
      { id: "editProfile" as const, labelKey: "social.editProfile" },
      { id: "addStory" as const, labelKey: "social.addStory" },
      { id: "createEvent" as const, labelKey: "social.createEvent" },
    ],
    []
  );

  const visitorActions = useMemo(
    () => [
      { id: "follow" as const, labelKey: "social.follow" },
      { id: "message" as const, labelKey: "social.message" },
      { id: "shareProfile" as const, labelKey: "social.shareProfile" },
      { id: "blockUser" as const, labelKey: "social.blockUser" },
      { id: "reportUser" as const, labelKey: "social.reportUser" },
    ],
    []
  );

  /* ------------------------------------------------------------------ */

  return {
    isOwner,
    profile,
    stats,
    followState,
    ownerActions,
    visitorActions,
    follow,
    unfollow,
    updateProfile,
  };
}