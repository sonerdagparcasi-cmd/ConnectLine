// src/domains/corporate/navigation/CorporateNavigator.tsx
// 🔒 Corporate Stack Navigator (STABLE – PROFILE ROUTE FIXED)

import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* ============================== SCREENS ============================== */

/* Tabs */
import CorporateTabsNavigator from "./CorporateTabsNavigator";

/* Profile */
import CorporateProfileContainerScreen from "../screens/CorporateProfileContainerScreen";

/* Settings */
import CorporateSettingsScreen from "../settings/CorporateSettingsScreen";

/* Home */
import CorporateHomeScreen from "../home/screens/CorporateHomeScreen";

/* Feed */
import CorporateFeedScreen from "../feed/screens/CorporateFeedScreen";

/* Feed / Media */
import CorporateMediaPreviewScreen from "../screens/CorporateMediaPreviewScreen";
import CorporatePostDetailScreen from "../screens/CorporatePostDetailScreen";

/* Jobs */
import CorporateApplyJobScreen from "../jobs/screens/CorporateApplyJobScreen";
import CorporateCreateJobScreen from "../jobs/screens/CorporateCreateJobScreen";
import CorporateJobDetailScreen from "../jobs/screens/CorporateJobDetailScreen";
import CorporateJobsScreen from "../jobs/screens/CorporateJobsScreen";

/* Messaging */
import CorporateConversationScreen from "../messaging/screens/CorporateConversationScreen";

/* Identity */
import CorporateIdentityCreateScreen from "../identity/screens/CorporateIdentityCreateScreen";
import CorporateWhoAreYouScreen from "../identity/screens/CorporateWhoAreYouScreen";

/* Announcements */
import CorporateAnnouncementsScreen from "../announcements/screens/CorporateAnnouncementsScreen";
import CorporateCreateAnnouncementScreen from "../announcements/screens/CorporateCreateAnnouncementScreen";

/* Analytics */
import CorporateAnalyticsScreen from "../analytics/screens/CorporateAnalyticsScreen";

/* Recruitment */
import CandidateDetailScreen from "../recruitment/screens/CandidateDetailScreen";
import CorporateCandidateRadarScreen from "../recruitment/screens/CorporateCandidateRadarScreen";

/* Onboarding */
import CorporateOnboardingScreen from "../onboarding/screens/CorporateOnboardingScreen";
import CorporateRoleSelectScreen from "../onboarding/screens/CorporateRoleSelectScreen";

/* Types */
import type { CorporateMediaItem } from "../types/feed.types";

/* ==================================================================== */
/* ROUTE TYPES                                                          */
/* ==================================================================== */

export type CorporatePostDetailPayload = {
  id: string;
  content?: string;
  createdAt: string;
  media?: CorporateMediaItem[];
  likeCount: number;
  isLiked?: boolean;
};

export type CorporateStackParamList = {
  /* Identity */
  CorporateWhoAreYou: undefined;
  CorporateIdentityCreate: undefined;
  CorporateIdentitySelect: undefined;

  /* Profile */
  CorporateProfile: { companyId?: string };

  /* Entry Worlds */
  CorporateFeed: undefined;
  CorporateTabs: undefined;

  /* Owner */
  CorporateHome: undefined;

  /* Feed */
  CorporatePostDetail: {
    post: CorporatePostDetailPayload;
    companyName: string;
  };

  CorporateMediaPreview: {
    media: CorporateMediaItem[];
    initialIndex?: number;
  };

  /* Jobs */
  CorporateJobs: undefined;
  CorporateJobDetail: { jobId: string };
  CorporateCreateJob: undefined;

  CorporateApplyJob:
    | { mode: "apply"; jobId: string }
    | { mode: "my" }
    | { mode: "inbox" };

  /* Recruitment */
  CorporateCandidateRadar: undefined;
  CandidateDetail: { id: string };

  /* Announcements */
  CorporateAnnouncements: undefined;
  CorporateCreateAnnouncement: undefined;

  /* Analytics */
  CorporateAnalytics: undefined;

  /* Onboarding */
  CorporateOnboarding: undefined;
  CorporateRoleSelect: undefined;

  /* Messaging */
  CorporateConversation: { conversationId: string };

  /* Settings */
  CorporateSettings: undefined;
};

/* ==================================================================== */
/* NAVIGATOR                                                            */
/* ==================================================================== */

const Stack = createNativeStackNavigator<CorporateStackParamList>();

type Props = {
  entry?: "feed" | "profile";
};

export default function CorporateNavigator({ entry = "profile" }: Props) {
  const initialRouteName: keyof CorporateStackParamList =
    entry === "feed" ? "CorporateFeed" : "CorporateTabs";

  return (
    <Stack.Navigator
      key={`corporate-${entry}`}
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      {/* Identity */}

      <Stack.Screen
        name="CorporateWhoAreYou"
        component={CorporateWhoAreYouScreen}
      />

      <Stack.Screen
        name="CorporateIdentityCreate"
        component={CorporateIdentityCreateScreen}
      />

      <Stack.Screen
        name="CorporateIdentitySelect"
        component={CorporateWhoAreYouScreen}
      />

      {/* Profile */}

      <Stack.Screen
        name="CorporateProfile"
        component={CorporateProfileContainerScreen}
      />

      {/* Feed */}

      <Stack.Screen
        name="CorporateFeed"
        component={CorporateFeedScreen}
      />

      {/* Tabs */}

      <Stack.Screen
        name="CorporateTabs"
        component={CorporateTabsNavigator}
      />

      {/* Owner */}

      <Stack.Screen
        name="CorporateHome"
        component={CorporateHomeScreen}
      />

      {/* Feed Detail */}

      <Stack.Screen
        name="CorporatePostDetail"
        component={CorporatePostDetailScreen}
      />

      <Stack.Screen
        name="CorporateMediaPreview"
        component={CorporateMediaPreviewScreen}
      />

      {/* Jobs */}

      <Stack.Screen
        name="CorporateJobs"
        component={CorporateJobsScreen}
      />

      <Stack.Screen
        name="CorporateJobDetail"
        component={CorporateJobDetailScreen}
      />

      <Stack.Screen
        name="CorporateCreateJob"
        component={CorporateCreateJobScreen}
      />

      <Stack.Screen
        name="CorporateApplyJob"
        component={CorporateApplyJobScreen}
      />

      {/* Recruitment */}

      <Stack.Screen
        name="CorporateCandidateRadar"
        component={CorporateCandidateRadarScreen}
      />

      <Stack.Screen
        name="CandidateDetail"
        component={CandidateDetailScreen}
      />

      {/* Announcements */}

      <Stack.Screen
        name="CorporateAnnouncements"
        component={CorporateAnnouncementsScreen}
      />

      <Stack.Screen
        name="CorporateCreateAnnouncement"
        component={CorporateCreateAnnouncementScreen}
      />

      {/* Analytics */}

      <Stack.Screen
        name="CorporateAnalytics"
        component={CorporateAnalyticsScreen}
      />

      {/* Onboarding */}

      <Stack.Screen
        name="CorporateOnboarding"
        component={CorporateOnboardingScreen}
      />

      <Stack.Screen
        name="CorporateRoleSelect"
        component={CorporateRoleSelectScreen}
      />

      {/* Messaging */}

      <Stack.Screen
        name="CorporateConversation"
        component={CorporateConversationScreen}
      />

      {/* Settings */}

      <Stack.Screen
        name="CorporateSettings"
        component={CorporateSettingsScreen}
      />
    </Stack.Navigator>
  );
}