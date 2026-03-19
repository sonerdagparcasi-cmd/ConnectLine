// src/domains/chat/navigation/ChatNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CallDetailScreen from "../screens/CallDetailScreen";
import CallScreen from "../screens/CallScreen";
import CallsHistoryScreen from "../screens/CallsHistoryScreen";
import ChatCallsScreen from "../screens/ChatCallsScreen";
import ChatCallScreen from "../screens/ChatCallScreen";
import ChatIncomingCallScreen from "../screens/ChatIncomingCallScreen";
import ChatContactsScreen from "../screens/ChatContactsScreen";
import ChatHomeScreen from "../screens/ChatHomeScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatInboxScreen from "../screens/ChatInboxScreen";
import ChatConversationScreen from "../screens/ChatConversationScreen";
import ChatProfileScreen from "../screens/ChatProfileScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import ConferenceScreen from "../screens/ConferenceScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupInfoScreen from "../screens/GroupInfoScreen";
import GroupMediaHistoryScreen from "../screens/GroupMediaHistoryScreen";
import MediaPreviewScreen from "../screens/MediaPreviewScreen";
import ChatMediaPreviewScreen from "../screens/ChatMediaPreviewScreen";
import StoryCreateScreen from "../screens/StoryCreateScreen";
import StorySeenScreen from "../screens/StorySeenScreen";
import StoryViewerScreen from "../screens/StoryViewerScreen";
import ChatStoryViewerScreen from "../story/screens/ChatStoryViewerScreen";
import ChatSettingsScreen from "../settings/ChatSettingsScreen";
import ChatPrivacyScreen from "../screens/ChatPrivacyScreen";
import ChatStorageScreen from "../screens/ChatStorageScreen";
import ChatContactProfileScreen from "../screens/ChatContactProfileScreen";

import { ChatProfileProvider } from "../profile/useChatProfile";

/* ------------------------------------------------------------------ */
/* TYPES (🔒 ROUTE CONTRACT – SOURCE OF TRUTH)                          */
/* ------------------------------------------------------------------ */

export type ChatStackParamList = {
  ChatHome: undefined;
  ChatList: undefined;
  ChatProfile: undefined;

  ChatRoom: {
    chatId: string;
    draftMessage?: string;
    fromStory?: boolean;
    storyId?: string;
    peerName?: string;
    pendingMedia?: { uri: string; type: "image" | "video"; caption?: string; replyTo?: { messageId: string; preview: string; mine: boolean } };
    pendingStoryReply?: {
      text: string;
      storyId: string;
      storyOwnerId: string;
      storyMediaUri?: string | null;
    };
  };

  ChatContacts: { mode?: "single" | "group" } | undefined;
  CreateGroup: undefined;

  Call: {
    type: "audio" | "video";
    userId: string;
  };

  Conference: {
    chatId: string;
  };

  MediaPreview: {
    uri: string;
    type: "image" | "video";
  };

  ChatMediaPreview: {
    uri: string;
    type: "image" | "video";
    chatId: string;
    peerName?: string;
    replyTo?: { messageId: string; preview: string; mine: boolean };
  };

  ChatSettings: undefined;
  ChatPrivacy: undefined;
  ChatStorage: undefined;
  ChatContactProfile: { userId: string; displayName?: string; avatarUri?: string };

  StoryCreate: undefined;
  StoryViewer: { storyId: string };
  StorySeen: { storyId: string };

  ChatStoryViewer: { currentUserId: string; initialStoryIndex?: number };

  CallsHistory: undefined;
  CallDetail: { callId: string };

  ChatCalls: undefined;
  ChatCall: { callId?: string; peerName?: string; chatId?: string; video?: boolean };
  ChatIncomingCall: { callId: string };

  GroupInfo: { chatId: string };
  GroupMediaHistory: { chatId: string };
};

/* ------------------------------------------------------------------ */
/* NAVIGATOR                                                           */
/* ------------------------------------------------------------------ */

type Props = {
  entry?: "home" | "list";
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatNavigator({ entry = "home" }: Props) {
  return (
    <ChatProfileProvider>
      <Stack.Navigator
        initialRouteName={entry === "home" ? "ChatHome" : "ChatList"}
        screenOptions={{
          animation: "fade",
        }}
      >
        {/* ==================== HOME ==================== */}
        <Stack.Screen
          name="ChatHome"
          component={ChatHomeScreen}
          options={{ headerShown: false }}
        />

        {/* ==================== LIST ==================== */}
        <Stack.Screen
          name="ChatList"
          component={ChatInboxScreen}
          options={{ headerShown: false }}
        />

        {/* ==================== PROFILE ================= */}
        <Stack.Screen
          name="ChatProfile"
          component={ChatProfileScreen}
          options={{ headerShown: false }}
        />

        {/* =================== STORIES ================== */}
        <Stack.Screen
          name="StoryCreate"
          component={StoryCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StoryViewer"
          component={StoryViewerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatStoryViewer"
          component={ChatStoryViewerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StorySeen"
          component={StorySeenScreen}
          options={{ headerShown: false }}
        />

        {/* ==================== CHAT ==================== */}
        <Stack.Screen
          name="ChatRoom"
          component={ChatConversationScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ChatContacts"
          component={ChatContactsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="GroupInfo"
          component={GroupInfoScreen}
          options={{ headerShown: false }}
        />

        {/* ==================== CALLS =================== */}
        <Stack.Screen
          name="Call"
          component={CallScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="CallsHistory"
          component={CallsHistoryScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="CallDetail"
          component={CallDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ChatCalls"
          component={ChatCallsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatCall"
          component={ChatCallScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatIncomingCall"
          component={ChatIncomingCallScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Conference"
          component={ConferenceScreen}
          options={{ headerShown: false }}
        />

        {/* ==================== MEDIA =================== */}
        <Stack.Screen
          name="MediaPreview"
          component={MediaPreviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatMediaPreview"
          component={ChatMediaPreviewScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="GroupMediaHistory"
          component={GroupMediaHistoryScreen}
          options={{ headerShown: false }}
        />

        {/* ================== SETTINGS ================== */}
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatPrivacy"
          component={ChatPrivacyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatStorage"
          component={ChatStorageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatContactProfile"
          component={ChatContactProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </ChatProfileProvider>
  );
}
