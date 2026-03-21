// src/domains/social/navigation/SocialNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* ------------------------------------------------------------------ */
/* SCREENS                                                            */
/* ------------------------------------------------------------------ */

import SocialCreatePostScreen from "../screens/SocialCreatePostScreen";
import SocialFeedScreen from "../screens/SocialFeedScreen";
import SocialMediaPreviewScreen from "../screens/SocialMediaPreviewScreen";
import SocialPostDetailScreen from "../screens/SocialPostDetailScreen";
import SocialEditPostScreen from "../screens/SocialEditPostScreen";
import SocialProfileContainerScreen from "../screens/SocialProfileContainerScreen";
import SocialFollowListScreen from "../screens/SocialFollowListScreen";
import SocialFollowRequestsScreen from "../screens/SocialFollowRequestsScreen";
import SocialStoryViewerScreen from "../screens/SocialStoryViewerScreen";

import SocialCreateEventScreen from "../screens/SocialCreateEventScreen";
import SocialEventDetailScreen from "../screens/SocialEventDetailScreen";
import SocialEventsScreen from "../screens/SocialEventsScreen";

import SocialHomeScreen from "../screens/SocialHomeScreen";

import SocialEditAvatarScreen from "../screens/SocialEditAvatarScreen";
import SocialEditBioScreen from "../screens/SocialEditBioScreen";
import SocialEditNameScreen from "../screens/SocialEditNameScreen";

import SocialSavedPostsScreen from "../screens/SocialSavedPostsScreen";

/* STORY */
import SocialCreateStoryScreen from "../story/screens/SocialCreateStoryScreen";
import SocialStoryEditorScreen from "../story/screens/SocialStoryEditorScreen";
import SocialCreateStoryEditorScreen from "../screens/SocialCreateStoryEditorScreen";
import SocialStoryInsightsScreen from "../screens/SocialStoryInsightsScreen";

/* EXPLORE */
import SocialExploreScreen from "../screens/SocialExploreScreen";
import SocialVideoFeedScreen from "../screens/SocialVideoFeedScreen";

/* 🆕 NOTIFICATIONS */
import SocialNotificationsScreen from "../screens/SocialNotificationsScreen";

/* MESSAGES (UI-only) */
import SocialInboxScreen from "../screens/SocialInboxScreen";
import SocialChatScreen from "../screens/SocialChatScreen";

import type { SocialMediaItem } from "../types/social.types";

/* ------------------------------------------------------------------ */
/* ROUTE TYPES                                                        */
/* ------------------------------------------------------------------ */

export type SocialStackParamList = {
  SocialProfileContainer: { userId?: string } | undefined;

  SocialFollowList: { userId: string; type: "followers" | "mutual" };

  SocialFollowRequests: undefined;

  SocialHome: undefined;

  SocialEditAvatar: undefined;
  SocialEditName: undefined;
  SocialEditBio: undefined;

  SocialFeed: undefined;

  SocialExplore: undefined;

  SocialVideoFeed: undefined;

  /* 🆕 NOTIFICATIONS */
  SocialNotifications: undefined;

  SocialInbox: undefined;
  SocialChat: { userId: string };

  SocialCreatePost: { editingPostId?: string } | undefined;
  SocialPostDetail: { postId: string };
  SocialEditPost: { postId: string };

  SocialMediaPreview: {
    media: SocialMediaItem[];
    initialIndex?: number;
  };

  SocialStoryViewer:
    | {
        initialUserId?: string;
        initialStoryIndex?: number;
        storyId?: string;
      }
    | undefined;

  SocialCreateStory: undefined;

  SocialStoryEditor: {
    media: {
      uri: string;
      type: "image" | "video";
      width: number;
      height: number;
    };
  };

  SocialCreateStoryEditor: undefined;

  SocialStoryInsights: {
    storyId: string;
  };

  SocialEvents: undefined;
  SocialEventDetail: { eventId: string };
  SocialCreateEvent: { editingEventId?: string } | undefined;

  SocialSavedPosts: undefined;
};

/* ------------------------------------------------------------------ */

type Props = {
  entry?: "feed" | "profile";
};

/* ------------------------------------------------------------------ */

const Stack = createNativeStackNavigator<SocialStackParamList>();

/* ------------------------------------------------------------------ */

export default function SocialNavigator({ entry = "feed" }: Props) {
  const initialRoute =
    entry === "profile"
      ? "SocialProfileContainer"
      : "SocialFeed";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* FEED */}
      <Stack.Screen name="SocialFeed" component={SocialFeedScreen} />

      {/* EXPLORE */}
      <Stack.Screen name="SocialExplore" component={SocialExploreScreen} />
      <Stack.Screen name="SocialVideoFeed" component={SocialVideoFeedScreen} />

      {/* 🆕 NOTIFICATIONS */}
      <Stack.Screen
        name="SocialNotifications"
        component={SocialNotificationsScreen}
      />

      <Stack.Screen
        name="SocialInbox"
        component={SocialInboxScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SocialChat"
        component={SocialChatScreen}
        options={{ headerShown: false }}
      />

      {/* PROFILE */}
      <Stack.Screen
        name="SocialProfileContainer"
        component={SocialProfileContainerScreen}
      />

      <Stack.Screen name="SocialFollowList" component={SocialFollowListScreen} />

      <Stack.Screen name="SocialFollowRequests" component={SocialFollowRequestsScreen} />

      {/* PROFILE SETTINGS */}
      <Stack.Screen name="SocialHome" component={SocialHomeScreen} />

      {/* PROFILE EDIT */}
      <Stack.Screen name="SocialEditAvatar" component={SocialEditAvatarScreen} />

      <Stack.Screen name="SocialEditName" component={SocialEditNameScreen} />

      <Stack.Screen name="SocialEditBio" component={SocialEditBioScreen} />

      {/* POST */}
      <Stack.Screen name="SocialCreatePost" component={SocialCreatePostScreen} />

      <Stack.Screen name="SocialPostDetail" component={SocialPostDetailScreen} />

      <Stack.Screen name="SocialEditPost" component={SocialEditPostScreen} />

      {/* MEDIA */}
      <Stack.Screen name="SocialMediaPreview" component={SocialMediaPreviewScreen} />

      {/* STORY */}
      <Stack.Screen name="SocialStoryViewer" component={SocialStoryViewerScreen} />

      <Stack.Screen name="SocialCreateStory" component={SocialCreateStoryScreen} />
      <Stack.Screen
        name="SocialStoryEditor"
        component={SocialStoryEditorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SocialCreateStoryEditor" component={SocialCreateStoryEditorScreen} />

      <Stack.Screen name="SocialStoryInsights" component={SocialStoryInsightsScreen} />

      {/* EVENTS */}
      <Stack.Screen name="SocialEvents" component={SocialEventsScreen} />

      <Stack.Screen name="SocialEventDetail" component={SocialEventDetailScreen} />

      <Stack.Screen name="SocialCreateEvent" component={SocialCreateEventScreen} />

      {/* SAVED */}
      <Stack.Screen name="SocialSavedPosts" component={SocialSavedPostsScreen} />
    </Stack.Navigator>
  );
}