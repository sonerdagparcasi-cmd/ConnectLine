import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type ReminderPayload = {
  reminderId: string;            // 🔑 EKLENDİ
  note: string;
  date: string;                  // YYYY-MM-DD
  time: string;                  // HH:mm
  targetUserIds: string[];
};

type Props = {
  visible: boolean;
  defaultUserIds: string[];

  initialValue?: {
    reminderId?: string;
    note: string;
    date: string;
    time: string;
    targetUserIds?: string[];
  };

  onClose: () => void;
  onSave: (payload: ReminderPayload) => void;
  onCancel?: () => void;
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function ChatReminderSheet({
  visible,
  defaultUserIds,
  initialValue,
  onClose,
  onSave,
  onCancel,
}: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const overlayBg = T.isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.25)";

  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [targets, setTargets] = useState<string[]>([]);
  const [addInput, setAddInput] = useState("");

  const baseTargets = useMemo(() => {
    const set = new Set<string>();
    (defaultUserIds || []).forEach((x) => x && set.add(x));
    return Array.from(set);
  }, [defaultUserIds]);

  useEffect(() => {
    if (!visible) return;

    setNote(initialValue?.note ?? "");
    setDate(initialValue?.date ?? "");
    setTime(initialValue?.time ?? "");

    const initTargets = initialValue?.targetUserIds?.length
      ? initialValue.targetUserIds
      : baseTargets;

    const set = new Set<string>();
    initTargets.forEach((x) => x && set.add(x));
    baseTargets.forEach((x) => x && set.add(x));
    setTargets(Array.from(set));

    setAddInput("");
  }, [visible, initialValue, baseTargets]);

  const canSave =
    note.trim().length > 0 && date.length > 0 && time.length > 0;

  function closeAndReset() {
    setNote("");
    setDate("");
    setTime("");
    setTargets([]);
    setAddInput("");
    onClose();
  }

  function addTargetsFromInput() {
    const raw = addInput.trim();
    if (!raw) return;

    const parts = raw.split(/[, ]+/g).filter(Boolean);

    setTargets((prev) => {
      const set = new Set(prev);
      parts.forEach((p) => set.add(p));
      baseTargets.forEach((b) => set.add(b));
      return Array.from(set);
    });

    setAddInput("");
  }

  function removeTarget(id: string) {
    if (baseTargets.includes(id)) return;
    setTargets((prev) => prev.filter((x) => x !== id));
  }

  function handleSave() {
    if (!canSave) return;

    const reminderId =
      initialValue?.reminderId ?? `reminder_${Date.now()}`;

    onSave({
      reminderId,
      note: note.trim(),
      date,
      time,
      targetUserIds: targets.length ? targets : baseTargets,
    });

    closeAndReset();
  }

  function handleCancel() {
    onCancel?.();
    closeAndReset();
  }

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeAndReset}>
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: overlayBg }]}
        activeOpacity={1}
        onPress={closeAndReset}
      />

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: T.backgroundColor,
            borderColor: T.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: T.textColor }]}>⏰ Hatırlatma</Text>

        {/* TARGETS */}
        <Text style={[styles.sectionTitle, { color: T.textColor }]}>
          {t("chat.reminder.targetContacts")}
        </Text>

        <View style={styles.chipsWrap}>
          {targets.map((id) => {
            const locked = baseTargets.includes(id);
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={locked ? 1 : 0.85}
                onPress={() => (!locked ? removeTarget(id) : null)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: T.cardBg,
                    borderColor: T.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: T.textColor }]}>
                  {id}
                </Text>
                {!locked && (
                  <Text style={[styles.chipX, { color: T.mutedText }]}>×</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* NOTE */}
        <Text style={[styles.sectionTitle, { color: T.textColor }]}>Not</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Hatırlatma notu yaz…"
          placeholderTextColor={T.mutedText}
          multiline
          style={[
            styles.input,
            {
              color: T.textColor,
              borderColor: T.border,
              backgroundColor: T.cardBg,
            },
          ]}
        />

        {/* DATE & TIME */}
        <View style={styles.row}>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="Tarih (YYYY-MM-DD)"
            placeholderTextColor={T.mutedText}
            style={[
              styles.smallInput,
              {
                color: T.textColor,
                borderColor: T.border,
                backgroundColor: T.cardBg,
              },
            ]}
          />
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="Saat (HH:mm)"
            placeholderTextColor={T.mutedText}
            style={[
              styles.smallInput,
              {
                color: T.textColor,
                borderColor: T.border,
                backgroundColor: T.cardBg,
              },
            ]}
          />
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          {onCancel && initialValue && (
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.cancelBtn, { borderColor: T.border }]}
            >
              <Text style={[styles.cancelText, { color: T.textColor }]}>
                Hatırlatmayı Sil
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={[
              styles.saveBtn,
              { backgroundColor: canSave ? T.accent : T.border },
            ]}
          >
            <Text style={[styles.saveText, { color: C.buttonText }]}>
              {initialValue ? "Güncelle" : "Kaydet"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    left: 12,
    right: 12,
    bottom: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
  chipX: { fontSize: 14, fontWeight: "900", marginTop: -1 },
  input: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  smallInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  actions: { flexDirection: "row", gap: 8 },
  saveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { fontWeight: "800" },
  cancelBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontWeight: "700", fontSize: 13 },
});