import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { chatMediaPicker, PickedMedia } from "../services/chatMediaPicker";
import ChatReminderSheet, {
  ReminderPayload,
} from "./ChatReminderSheet";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type AttachmentType =
  | "image"
  | "video"
  | "file"
  | "location"
  | "contact"
  | "reminder";

export type ContactPayload = { name: string; phone?: string };
export type LocationPayload = { lat: number; lng: number; label?: string };

/** 🎯 Composer → Screen contract */
export type ComposerSelectPayload =
  | PickedMedia
  | ReminderPayload
  | ContactPayload
  | LocationPayload
  | undefined;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (
    type: AttachmentType,
    payload?: ComposerSelectPayload
  ) => void;
};

/* ------------------------------------------------------------------ */
/* DATA                                                                */
/* ------------------------------------------------------------------ */

const MOCK_CONTACTS: ContactPayload[] = [
  { name: "Ali Yılmaz", phone: "+90 532 111 2233" },
  { name: "Ayşe Demir", phone: "+90 533 444 5566" },
  { name: "Mehmet Kaya", phone: "+90 534 777 8899" },
  { name: "Zeynep Öz", phone: "+90 535 000 1122" },
];

const MOCK_LOCATION: LocationPayload = {
  lat: 41.0082,
  lng: 28.9784,
  label: "Istanbul, Turkey",
};

const COMPOSER_OFFSET = 104;

const ATTACHMENT_ACTIONS: { type: AttachmentType; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "image", labelKey: "chat.attach.photo", icon: "camera" },
  { type: "video", labelKey: "chat.attach.video", icon: "videocam" },
  { type: "file", labelKey: "chat.attach.file", icon: "document" },
  { type: "location", labelKey: "chat.attach.location", icon: "location" },
  { type: "contact", labelKey: "chat.attach.contact", icon: "person" },
  { type: "reminder", labelKey: "chat.attach.reminder", icon: "alarm" },
];

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function ChatComposerSheet({
  visible,
  onClose,
  onSelect,
}: Props) {
  const T = useAppTheme();
  const overlayBg = T.isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.25)";
  const [reminderVisible, setReminderVisible] = useState(false);
  const [contactPickerVisible, setContactPickerVisible] = useState(false);

  if (!visible) return null;

  const handleImageSource = () => {
    Alert.alert(
      t("chat.attach.photo"),
      undefined,
      [
        { text: t("chat.attach.camera"), onPress: () => pickImage("camera") },
        { text: t("chat.attach.gallery"), onPress: () => pickImage("gallery") },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  const handleVideoSource = () => {
    Alert.alert(
      t("chat.attach.video"),
      undefined,
      [
        { text: t("chat.attach.camera"), onPress: () => pickVideo("camera") },
        { text: t("chat.attach.gallery"), onPress: () => pickVideo("gallery") },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  const pickImage = async (source: "camera" | "gallery") => {
    try {
      const media = source === "camera"
        ? await chatMediaPicker.pickImageFromCamera()
        : await chatMediaPicker.pickImageFromGallery();
      if (media) {
        onSelect("image", media);
        onClose();
      }
    } catch (err) {
      console.warn("Pick image error:", err);
    }
  };

  const pickVideo = async (source: "camera" | "gallery") => {
    try {
      const media = source === "camera"
        ? await chatMediaPicker.pickVideoFromCamera()
        : await chatMediaPicker.pickVideoFromGallery();
      if (media) {
        onSelect("video", media);
        onClose();
      }
    } catch (err) {
      console.warn("Pick video error:", err);
    }
  };

  const handleContactSelect = (contact: ContactPayload) => {
    onSelect("contact", contact);
    setContactPickerVisible(false);
    onClose();
  };

  const handleSelect = async (type: AttachmentType) => {
    try {
      switch (type) {
        case "image":
          handleImageSource();
          return;
        case "video":
          handleVideoSource();
          return;
        case "file": {
          const file = await chatMediaPicker.pickFile();
          if (!file) return;
          onSelect(type, file);
          onClose();
          return;
        }

        case "location":
          onSelect(type, MOCK_LOCATION);
          onClose();
          return;
        case "contact":
          setContactPickerVisible(true);
          return;

        case "reminder":
          setReminderVisible(true);
          return;
      }
    } catch (err) {
      console.warn("ChatComposer error:", err);
      onClose();
    }
  };

  return (
    <>
      {/* COMPOSER SHEET */}
      <Modal transparent animationType="fade" visible onRequestClose={onClose}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: overlayBg }]}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: T.backgroundColor,
              borderColor: T.border,
              bottom: COMPOSER_OFFSET,
            },
          ]}
        >
          {contactPickerVisible ? (
            <View style={styles.contactPicker}>
              <TouchableOpacity
                onPress={() => setContactPickerVisible(false)}
                style={[styles.contactHeader, { borderColor: T.border }]}
              >
                <Ionicons name="chevron-back" size={22} color={T.textColor} />
                <Text style={[styles.contactTitle, { color: T.textColor }]}>
                  {t("chat.attach.contact")}
                </Text>
              </TouchableOpacity>
              <ScrollView style={styles.contactList}>
                {MOCK_CONTACTS.map((c, i) => (
                  <TouchableOpacity
                    key={`${c.name}-${i}`}
                    style={[styles.contactRow, { borderColor: T.border }]}
                    onPress={() => handleContactSelect(c)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-circle" size={36} color={T.accent} />
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: T.textColor }]} numberOfLines={1}>
                        {c.name}
                      </Text>
                      {c.phone ? (
                        <Text style={[styles.contactPhone, { color: T.mutedText }]} numberOfLines={1}>
                          {c.phone}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="send" size={20} color={T.mutedText} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.grid}>
              {ATTACHMENT_ACTIONS.map((a) => (
                <TouchableOpacity
                  key={a.type}
                  style={styles.item}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(a.type)}
                >
                  <Ionicons name={a.icon} size={26} color={T.accent} />
                  <Text style={[styles.label, { color: T.textColor }]}>
                    {t(a.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Modal>

      {/* REMINDER SHEET (CHAT DOMAIN, IZOLASYON TAM) */}
      <ChatReminderSheet
        visible={reminderVisible}
        defaultUserIds={[]}
        onClose={() => setReminderVisible(false)}
        onSave={(payload: ReminderPayload) => {
          onSelect("reminder", payload);
          setReminderVisible(false);
          onClose();
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    left: 8,
    right: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    width: "33.33%",
    alignItems: "center",
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },
  contactPicker: {
    maxHeight: 320,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactList: {
    maxHeight: 260,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontSize: 15, fontWeight: "600" },
  contactPhone: { fontSize: 13, marginTop: 2 },
});
