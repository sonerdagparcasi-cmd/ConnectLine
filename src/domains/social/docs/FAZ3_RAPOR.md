# FAZ 3 – Sosyal Story Sistemi Raporu

## 1) Story create ile editor arasında hangi kopukluk var?

- **Navigasyon:** `SocialCreateStoryEditorScreen` navigator’da tanımlı değil; sadece `SocialCreateStory` var. Create ekranından Editor’e geçiş yok, Editor’e doğrudan route yok.
- **Veri akışı:** Create ekranı sadece yerel `text` state ve "Paylaş" ile `goBack()` yapıyor. Editor kendi içinde `textNote`, `visibility`, `music` tutuyor; `onShare()` sadece Alert gösteriyor, hiçbir servise yazmıyor veya Create’e veri dönmüyor.
- **Story listesi:** Create/Editor’dan paylaşılan hikâye hiçbir yere eklenmiyor. Viewer sadece `MOCK_STORIES` kullanıyor; kullanıcının oluşturduğu hikâyeler listeye girmiyor.
- **Özet:** Create ↔ Editor arasında hem ekran akışı (navigate → Editor → paylaş → geri) hem de paylaşılan hikâyenin tek listeye (viewer’ın kullandığı) yazılması eksik.

---

## 2) Story viewer şu an hangi state kaynaklarını kullanıyor?

- **Story listesi:** Sadece `MOCK_STORIES` (sabit mock). `groupStoriesByUser(MOCK_STORIES)` ile gruplanıyor. Servisten gelen veya create ile eklenen hikâye yok.
- **Seen:** `socialStoryStateService.markStoryViewed(storyId)` / `isStoryViewed(storyId)` — sadece “görüldü” Set’i, “kim gördü” listesi yok.
- **Reply / reaction:** Viewer’da `sendReaction` ve `sendComment` sadece `Alert.alert`; `socialStoryStateService` veya `socialStoryReplyService` çağrılmıyor. Yani reply/reaction state’e hiç yazılmıyor.
- **Özet:** Viewer tek gerçek kaynak olarak “seen” (story id Set) kullanıyor; liste mock, reply/reaction bağlı değil.

---

## 3) Seen / reaction / reply tek mantıkta nasıl birleşecek?

- **Seen (görüldü):** Mevcut `socialStoryStateService.markStoryViewed(storyId)` kalsın. İsteğe bağlı: “kim gördü” için `addStoryView(storyId, viewerUserId)` + `getStoryViewers(storyId)` eklenebilir; Insights “who viewed” için kullanılır.
- **Reply:** Tek kaynak `socialStoryReplyService`: `addStoryReply(storyId, senderUserId, senderUsername, message)`. Viewer’da gönder butonu bu API’yi çağıracak; gerekirse `socialNotificationService` (story_reply) tetiklenir. Insights “who replied” için `getStoryReplies(storyId)` kullanılır.
- **Reaction:** Yine `socialStoryReplyService`: `addStoryReaction(storyId, senderUserId, senderUsername, emoji)`. Viewer’daki quick bar (❤️ 🔥 👏 😍 😂) bu API’yi çağıracak. Insights “who reacted” için aynı `getStoryReplies` içinden `type === "reaction"` filtre edilir veya `getStoryReactions(storyId)` benzeri bir getter.
- **Çakışma:** `socialStoryStateService` içinde de reply/reaction var; FAZ 3’te tek kaynak `socialStoryReplyService` olacak. State service sadece “viewed” (ve varsa “viewers”) kalsın; reply/reaction oradan kaldırılabilir veya reply service’e delegate edilir.

---

## 4) Rail üzerinde seen/unseen nasıl bağlanacak?

- **Mevcut:** `SocialStoriesRail` ve `SocialStoriesProfileRail` zaten `socialStoryStateService.isStoryViewed(storyId)` kullanıyor. Gruptaki tüm hikâyeler görüldüyse “seen” halkası (gri), değilse “unseen” (yeşil/gradient).
- **Bağlantı:** Viewer’da hikâye gösterilirken `markStoryViewed(story.id)` zaten çağrılıyor; rail’in aynı servisi kullanması yeterli. Ek: Rail’e beslenen liste `getStories()` gibi tek kaynaktan gelmeli (MOCK + create ile eklenenler); böylece yeni hikâyeler de rail’de görünür.
- **Muted/blocked:** Feed’de story listesi `isMuted(userId)` / `isBlocked(userId)` ile filtreleniyor; rail’de de aynı filtre uygulanacak. Böylece muted/blocked kullanıcıların hikâyeleri rail’de çıkmaz.

---

## Uygulama özeti

1. **Create → Editor akışı:** Navigator’a `SocialCreateStoryEditor` ekle; Create’den "Hikaye Ekle" / metin sonrası Editor’e navigate et; Editor’da "Paylaş" → servise hikâye ekle + goBack.
2. **Tek story listesi:** `socialStoryStateService` (veya mock’u genişleten bir modül) içinde `addStory(story)`, `getStories()`; viewer ve rail `getStories()` kullanacak, Create/Editor paylaşınca `addStory` çağrılacak.
3. **Viewer:** Reply için `socialStoryReplyService.addStoryReply`, reaction için `addStoryReaction`; reply sonrası `addNotification(type: "story_reply")`; tüm metinler i18n, renkler `useAppTheme()`.
4. **Insights:** Veriyi `socialStoryStateService` (viewers) + `socialStoryReplyService` (replies: message + reaction) ile doldur; sadece story sahibi görsün.
5. **Rail:** Liste `getStories()` + muted/blocked filtre; seen/unseen için `isStoryViewed` kullanımı aynı kalacak; tema ve i18n.
6. **Story tipi (social.types):** `SocialStory` gerekirse `expiresAt`, `audience`, `eventRef` vb. ile genişletilir; mevcut alanlar bozulmaz.
