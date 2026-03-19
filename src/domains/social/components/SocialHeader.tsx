// src/domains/social/components/SocialHeader.tsx
// 🔒 SOCIAL GLOBAL HEADER – AppGradientHeader wrapper

import { useNavigation } from "@react-navigation/native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";

type Props = {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export default function SocialHeader({
  title,
  showBack = true,
  right,
}: Props) {
  const navigation = useNavigation();

  function goBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  return (
    <AppGradientHeader
      title={title}
      onBack={showBack ? goBack : undefined}
      right={right}
    />
  );
}
