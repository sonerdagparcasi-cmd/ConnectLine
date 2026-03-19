# FAZ 5 – Bildirim, Feed Sıralama, Moderasyon, Spam, Performans Raporu

## 1) Bildirim sistemi şu an nasıl çalışıyor?

- **Servis:** `socialNotificationService` tek bir `NOTIFICATIONS` listesi tutuyor; `addNotification(notification)`, `getNotifications()`, `markNotificationRead(id)`, `markAllNotificationsRead()`, `subscribeNotifications(listener)` var. Tip `SocialNotification` (id, type, actorUserId, actorUsername, targetUserId, postId?, storyId?, eventId?, text, createdAt, read).
- **Tipler:** `SocialNotificationType`: follow, like, comment, share, story_reply, event_invite. `story_reaction` eksik; eklenmeli.
- **Üretim:** Bildirimler şu an sadece UI tarafında manuel ekleniyor (Feed’de like/share, profil follow, story viewer’da reply). Tüm olaylar (follow, like, comment, share, story_reply, story_reaction, event_invite) için tek noktadan `addNotification` çağrılmalı; mevcut çağrılar korunup eksikler tamamlanmalı.
- **Tıklama:** `SocialNotificationsScreen` içinde `openNotification(n)` sadece `n.postId` varsa PostDetail’e gidiyor. `storyId` → StoryViewer, `eventId` → EventDetail, sadece `targetUserId` (profil) → Profile yönlendirmesi eklenmeli.

---

## 2) Feed sıralaması nerede yapılıyor?

- **socialFeedService:** `getFeedPosts()` = following (tarih sıralı) + recommended (tarih sıralı), `sortByDate` ile sadece kronolojik. State service bu listeyi `getBaseFeedPosts()` ile alıp `initStore`/timeline’da kullanıyor.
- **socialFeedStateService:** `getFeedPosts()` cache’lenmiş `getAllPosts()` döndürüyor; sıralama POST_ORDER’a göre (ekleme sırası). Yani sıralama fiilen socialFeedService’teki merge + date.
- **Plan:** `socialFeedService` içinde `rankFeedPosts(posts)` yardımcı fonksiyonu: following önceliği, son aktivite (like/comment), like/comment sayısı, mutual etkileşim gibi basit skorlarla sıralasın. State service feed üretirken (veya getFeedPosts dönerken) bu sıralamayı kullansın; böylece tek yer feed service kalır, state service sadece veriyi alıp filtreleyip sıralı döner.

---

## 3) Spam kontrolü nasıl uygulanabilir?

- **Yer:** Mantık servis katmanında; yeni mimari kurulmadan mevcut sosyal servislere eklenebilir. Örn. `socialFeedStateService` içinde veya hafif bir `socialSpamService` (tek dosya).
- **Kurallar (örnek):**
  - Çok hızlı post: Son X dakikada en fazla Y post (örn. 5 dk’da 1).
  - Aynı içerik tekrar: Son post’un caption’ı ile birebir aynı ise reddet veya uyar.
  - Çok hızlı yorum: Aynı post’a son Z saniyede ikinci yorum engelle.
- **Uygulama:** Son post/comment zamanları ve (opsiyonel) son caption bir modül içinde tutulur; `canCreatePost()`, `canAddComment(postId)` gibi fonksiyonlar “geçici kısıtlama” durumunda false döner. UI bu sonucu kontrol edip kullanıcıya “Biraz bekleyin” benzeri mesaj gösterir. Gerçek engelleme (ör. 5 dk bekle) serviste basit timestamp ile yapılır.

---

## 4) Moderasyon sistemi nerede tutulmalı?

- **Mevcut:** `socialReportService` zaten var: `reportUser`, `reportPost`, `REPORT_REASONS` (spam, fake_account, abuse, other). Raporlar bellekte `REPORTS` dizisine ekleniyor.
- **Genişletme:** Rapor türlerine `violence` eklenir; tipler `social.types` içinde kalır. Yeni servis gerekmez; `socialReportService` raporları saklamaya ve (ileride) “report count” veya moderatör listesi için kullanılmaya devam eder. UI sade kalır: mevcut report akışı (post/kullanıcı bildir, sebep seç) aynen kullanılır, sadece sebep listesi güncellenir.

---

## Uygulama özeti

1. **Bildirim:** `SocialNotificationType`’a `story_reaction` ekle. Tıklamada `postId` → PostDetail, `storyId` → StoryViewer, `eventId` → EventDetail, yoksa `actorUserId`/`targetUserId` → Profile. Event invite bildirimi oluşturan noktayı (event davet akışı) bağla.
2. **Notification UI:** Read/unread, avatar, time ago, varsa post/event önizlemesi; tema; liste için memoized row.
3. **Feed ranking:** `socialFeedService` içinde `rankFeedPosts(posts, options?)`; state service feed’i bu sıralamayla sunar veya base feed’i rank’leyen tek yer feed service olur.
4. **Muted/blocked:** Feed listesi oluşturulurken `socialFollowService.isBlocked(userId)` ve `isMuted(userId)` ile filtrele; state service veya feed service tarafında uygula.
5. **Spam:** Servis seviyesinde son post/comment zamanı + opsiyonel caption; `canCreatePost()`, `canAddComment(postId)`; geçici kısıtlama mesajı UI’da.
6. **Moderasyon:** `SocialReportReason`’a `violence` ekle; `REPORT_REASONS` güncelle.
7. **Profil güvenlik:** `socialProfileStore` (veya profil state) içinde privateAccount, allowMessageRequests, allowStoryReplies, hideOnlineStatus alanları ve setter’lar.
8. **Performans:** Feed’de FlatList getItemLayout / windowSize / maxToRenderPerBatch; PostCard memo; görsel lazy loading (mevcut yapı korunur).
9. **i18n + empty state:** Yeni anahtarlar; feed, explore, notifications, saved posts için boş ekran metinleri.
