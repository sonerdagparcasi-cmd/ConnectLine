// src/domains/corporate/messaging/screens/CorporateInboxScreen.tsx

import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporateTopBar from "../../components/CorporateTopBar";
import InboxBulkActionBar from "../components/InboxBulkActionBar";
import InboxSearchFilter, {
  InboxFilter,
} from "../components/InboxSearchFilter";
import SelectableConversationRow from "../components/SelectableConversationRow";
import { useCorporateInbox } from "../hooks/useCorporateMessaging";
import { CorporateConversation } from "../types/messaging.types";

export default function CorporateInboxScreen({ navigation }: any) {
  const T = useAppTheme();
  const { conversations } = useCorporateInbox();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* ------------------------------------------------------------------ */
  /* FILTERED DATA                                                      */
  /* ------------------------------------------------------------------ */

  const data = useMemo<CorporateConversation[]>(() => {
    return conversations.filter((c) => {
      // text search
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${c.candidateName} ${c.lastMessageText ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // unread filter
      if (filter === "unread" && c.unreadCount === 0) return false;

      return true;
    });
  }, [conversations, query, filter]);

  /* ------------------------------------------------------------------ */
  /* SELECTION                                                          */
  /* ------------------------------------------------------------------ */

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function clearSelection() {
    setSelectionMode(false);
    setSelectedIds([]);
  }

  function markRead() {
    // UI-level mock
    clearSelection();
  }

  function archive() {
    // UI-level mock
    clearSelection();
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title={t("corporate.inbox.title")} />

      <InboxBulkActionBar
        selectedCount={selectedIds.length}
        onClear={clearSelection}
        onMarkRead={markRead}
        onArchive={archive}
      />

      <InboxSearchFilter
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      <FlatList
        contentContainerStyle={{ paddingBottom: 16 }}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SelectableConversationRow
            item={item}
            selected={selectedIds.includes(item.id)}
            selectionMode={selectionMode}
            onLongPress={() => {
              if (!selectionMode) {
                setSelectionMode(true);
                setSelectedIds([item.id]);
              }
            }}
            onPress={() => {
              if (selectionMode) {
                toggleSelect(item.id);
              } else {
                navigation.navigate("CorporateConversation", {
                  conversationId: item.id,
                });
              }
            }}
          />
        )}
      />
    </View>
  );
}