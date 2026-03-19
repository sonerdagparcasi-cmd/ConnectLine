import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SocialCreateStoryScreen from "../domains/social/story/screens/SocialCreateStoryScreen";

export type SocialStackRootParamList = {
  SocialCreateStory: undefined;
};

const Stack = createNativeStackNavigator<SocialStackRootParamList>();

export default function SocialStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SocialCreateStory"
        component={SocialCreateStoryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
