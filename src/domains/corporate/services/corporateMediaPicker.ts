// src/domains/corporate/services/corporateMediaPicker.ts

import * as ImagePicker from "expo-image-picker";

export type CorporatePickedMedia = {
  type: "image" | "video";
  uri: string;
};

class CorporateMediaPicker {
  async pick(): Promise<CorporatePickedMedia | null> {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    const asset = result.assets[0];

    return {
      type: asset.type === "video" ? "video" : "image",
      uri: asset.uri,
    };
  }
}

export const corporateMediaPicker = new CorporateMediaPicker();