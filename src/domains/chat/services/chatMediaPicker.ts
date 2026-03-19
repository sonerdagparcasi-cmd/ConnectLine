import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import { chatMediaService } from "./chatMediaService";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type PickedImage = {
  kind: "image";
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
};

export type PickedVideo = {
  kind: "video";
  uri: string;
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
};

export type PickedFile = {
  kind: "file";
  uri: string;
  mimeType?: string;
  fileName?: string;
  size?: number;
};

export type PickedMedia = PickedImage | PickedVideo | PickedFile;

export type UploadResult = {
  url: string;
  mimeType?: string;
  fileName?: string;
  size?: number;
};

const MAX_VIDEO_DURATION_SEC = 60;

type ImagePickerAsset = {
  type: "image" | "video";
  uri: string;
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
};

function mapAssetToMedia(asset: ImagePickerAsset): PickedImage | PickedVideo {
  if (asset.type === "video") {
    return {
      kind: "video",
      uri: asset.uri,
      duration: asset.duration ?? undefined,
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
    };
  }
  return {
    kind: "image",
    uri: asset.uri,
    width: asset.width ?? undefined,
    height: asset.height ?? undefined,
    mimeType: asset.mimeType ?? undefined,
    fileName: asset.fileName ?? undefined,
  };
}

function rejectVideoTooLong(): void {
  Alert.alert("Video 60 saniyeden uzun olamaz.");
}

/* ------------------------------------------------------------------ */
/* MEDIA PICKER + UPLOAD ADAPTER                                       */
/* ------------------------------------------------------------------ */

class ChatMediaPicker {
  /* ---------------- PICKERS ---------------- */

  async pickFromCamera(): Promise<PickedMedia | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Kamera izni verilmedi");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      videoMaxDuration: MAX_VIDEO_DURATION_SEC,
      videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
    });

    if (result.canceled) return null;

    const asset = result.assets[0] as ImagePickerAsset;
    const media = mapAssetToMedia(asset);
    if (media.kind === "video" && (media.duration ?? 0) > MAX_VIDEO_DURATION_SEC) {
      rejectVideoTooLong();
      return null;
    }
    return media;
  }

  async pickImageFromCamera(): Promise<PickedImage | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Kamera izni verilmedi");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled) return null;

    const asset = result.assets[0] as ImagePickerAsset;
    return mapAssetToMedia(asset) as PickedImage;
  }

  async pickImageFromGallery(): Promise<PickedImage | null> {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Galeri izni verilmedi");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return null;

    const asset = result.assets[0] as ImagePickerAsset;
    return mapAssetToMedia(asset) as PickedImage;
  }

  async pickVideoFromCamera(): Promise<PickedVideo | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Kamera izni verilmedi");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.85,
      videoMaxDuration: MAX_VIDEO_DURATION_SEC,
      videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
    });

    if (result.canceled) return null;

    const asset = result.assets[0] as ImagePickerAsset;
    const media = mapAssetToMedia(asset) as PickedVideo;
    if ((media.duration ?? 0) > MAX_VIDEO_DURATION_SEC) {
      rejectVideoTooLong();
      return null;
    }
    return media;
  }

  async pickVideoFromGallery(): Promise<PickedVideo | null> {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Galeri izni verilmedi");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return null;

    const asset = result.assets[0] as ImagePickerAsset;
    const media = mapAssetToMedia(asset) as PickedVideo;
    if ((media.duration ?? 0) > MAX_VIDEO_DURATION_SEC) {
      rejectVideoTooLong();
      return null;
    }
    return media;
  }

  async pickFromGallery(): Promise<PickedMedia | null> {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Galeri izni verilmedi");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return null;

    const asset = result.assets[0] as ImagePickerAsset;
    const media = mapAssetToMedia(asset);
    if (media.kind === "video" && (media.duration ?? 0) > MAX_VIDEO_DURATION_SEC) {
      rejectVideoTooLong();
      return null;
    }
    return media;
  }

  async pickFile(): Promise<PickedMedia | null> {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return null;

    const file = result.assets[0];

    return {
      kind: "file",
      uri: file.uri,
      mimeType: file.mimeType ?? undefined,
      fileName: file.name ?? undefined,
      size: file.size ?? undefined,
    };
  }

  /* ---------------- UPLOAD (UI-LEVEL) ---------------- */

  async uploadMedia(
    media: PickedMedia,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const result = await chatMediaService.upload({
      uri: media.uri,
      type: media.kind,
      fileName: media.fileName,
      onProgress,
    });

    return {
      url: result.url || media.uri,
      mimeType: media.mimeType ?? undefined,
      fileName: media.fileName ?? undefined,
      size: media.kind === "file" ? media.size ?? undefined : undefined,
    };
  }
}

/* ------------------------------------------------------------------ */
/* SINGLETON                                                           */
/* ------------------------------------------------------------------ */

export const chatMediaPicker = new ChatMediaPicker();
