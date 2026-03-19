// src/domains/chat/components/composer/ChatAttachmentSheet.tsx
// Professional bottom sheet attachment panel for the chat composer.

import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { chatMediaPicker, PickedMedia } from "../../services/chatMediaPicker";
import ChatReminderSheet, { ReminderPayload } from "../ChatReminderSheet";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type AttachmentType =
  | "image"
  | "video"
  | "file"
  | "location"
  | "contact"
  | "reminder"
  | "audio"
  | "poll";

export type ContactPayload = { name: string; phone?: string };
export type LocationPayload = { lat: number; lng: number; label?: string };

export type ComposerSelectPayload =
  | PickedMedia
  | ReminderPayload
  | ContactPayload
  | LocationPayload
  | undefined;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: AttachmentType, payload?: ComposerSelectPayload) => void;
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

const GRID_ITEMS: { type: AttachmentType; emoji: string; labelKey: string }[] = [
  { type: "image", emoji: "📷", labelKey: "chat.attach.image" },
  { type: "video", emoji: "🎥", labelKey: "chat.attach.video" },
  { type: "file", emoji: "📁", labelKey: "chat.attach.file" },
  { type: "audio", emoji: "🎵", labelKey: "chat.attach.audioFile" },
  { type: "location", emoji: "📍", labelKey: "chat.location" },
  { type: "contact", emoji: "👤", labelKey: "chat.contact" },
  { type: "reminder", emoji: "⏰", labelKey: "chat.attach.reminder" },
  { type: "poll", emoji: "🗳", labelKey: "chat.attach.poll" },
];

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function ChatAttachmentSheet({
  visible,
  onClose,
  onSelect,
}: Props) {
  const T = useAppTheme();
  const overlayBg = T.isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.35)";
  const insets = useSafeAreaInsets();
  const [reminderVisible, setReminderVisible] = useState(false);
  const [contactPickerVisible, setContactPickerVisible] = useState(false);

  if (!visible) return null;

  /** Open device gallery for image or video via chatMediaPicker; close sheet only after a successful selection. */
  const openGallery = async (mediaType: "image" | "video") => {
    try {
      const picked =
        mediaType === "image"
          ? await chatMediaPicker.pickImageFromGallery()
          : await chatMediaPicker.pickVideoFromGallery();
      if (picked) {
        onClose();
        onSelect(mediaType, picked);
      }
    } catch (err) {
      console.warn("Gallery picker error:", err);
    }
  };

  const handleContactSelect = (contact: ContactPayload) => {
    onSelect("contact", contact);
    setContactPickerVisible(false);
    onClose();
  };

  const handleAction = async (type: AttachmentType) => {
    try {
      switch (type) {
        case "image":
          await openGallery("image");
          return;
        case "video":
          await openGallery("video");
          return;
        case "file": {
          const file = await chatMediaPicker.pickFile();
          if (!file) return;
          onSelect("file", file);
          onClose();
          return;
        }
        case "audio": {
          const file = await chatMediaPicker.pickFile();
          if (!file) return;
          onSelect("file", file);
          onClose();
          return;
        }
        case "location":
          onSelect("location", MOCK_LOCATION);
          onClose();
          return;
        case "contact":
          setContactPickerVisible(true);
          return;
        case "reminder":
          setReminderVisible(true);
          return;
        case "poll":
          onSelect("poll");
          onClose();
          return;
      }
    } catch (err) {
      console.warn("ChatAttachmentSheet error:", err);
      onClose();
    }
  };

  return (
    <>
      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={[styles.backdrop, { backgroundColor: overlayBg }]}
            activeOpacity={1}
            onPress={onClose}
          />
         <View
  style={[
    styles.sheet,
    {
      backgroundColor: "#1b1a1a",
      borderColor: T.border,
      paddingBottom: 30 + insets.bottom,
    },
  ]}
>
          {contactPickerVisible ? (
            <View style={styles.contactPicker}>
              <TouchableOpacity
                onPress={() => setContactPickerVisible(false)}
                style={[styles.contactHeader, { borderColor: T.border }]}
              >
                <Text style={[styles.contactTitle, { color: T.textColor }]}>
                  ← {t("chat.contact")}
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
                    <Text style={styles.contactEmoji}>👤</Text>
                    <View style={styles.contactInfo}>
                      <Text
                        style={[styles.contactName, { color: T.textColor }]}
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                      {c.phone ? (
                        <Text
                          style={[styles.contactPhone, { color: T.mutedText }]}
                          numberOfLines={1}
                        >
                          {c.phone}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.contactSend, { color: T.mutedText }]}>➤</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                {GRID_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={styles.gridItem}
                    activeOpacity={0.7}
                    onPress={() => handleAction(item.type)}
                  >
                    <Text style={styles.emoji}>{item.emoji}</Text>
                    <Text
                      style={[styles.gridLabel, { color: T.textColor }]}
                      numberOfLines={1}
                    >
                      {t(item.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: T.border,
                    borderColor: T.border,
                  },
                ]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelText, { color: T.textColor }]}>
                  İptal
                </Text>
              </TouchableOpacity>
            </>
          )}
          </View>
        </View>
      </Modal>

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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 18,
    paddingBottom: 30,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 18,
  },
  emoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  cancelBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactPicker: {
    maxHeight: 320,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    marginBottom: 8,
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
  contactEmoji: {
    fontSize: 24,
  },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontSize: 15, fontWeight: "600" },
  contactPhone: { fontSize: 13, marginTop: 2 },
  contactSend: {
    fontSize: 16,
  },
});
