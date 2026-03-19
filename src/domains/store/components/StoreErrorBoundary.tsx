import React from "react";
import { Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export class StoreErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
          <Fallback />
        </View>
      );
    }
    return this.props.children;
  }
}

function Fallback() {
  const T = useAppTheme();
  return <Text style={{ color: T.mutedText }}>Bir hata oluştu.</Text>;
}