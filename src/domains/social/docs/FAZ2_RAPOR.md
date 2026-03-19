# FAZ 2 – Sosyal Etkileşim Sistemi Raporu

## 1) Like state şu an nerede tutuluyor?

- **Kaynak:** `socialFeedStateService` içindeki `POST_MAP` (her öğe `SocialPost`).
- Her post için `likedByMe` ve `likeCount` alanları burada.
- **Güncelleme:** Feed ve PostDetail ekranları doğrudan `updatePost({ ...post, likedByMe, likeCount })` çağırıyor; yani like bilgisi zaten tek kaynakta (POST_MAP) tutuluyor.
- **Eksik:** Serviste `toggleLike(postId)` yok; her ekran kendi post nesnesini alıp güncelleyip `updatePost` çağırıyor. Tek noktada toplamak için `toggleLike(postId)` eklenmeli.

---

## 2) Save state nerede tutuluyor?

- **Kaynak:** `socialFeedStateService` içinde `SAVED: Record<string, boolean>`.
- **API:** `toggleSavedPost(postId)`, `isPostSaved(postId)`, `getSavedPosts()`.
- Feed’de yerel `savedMap` yok; Feed ve PostDetail bu API’yi kullanıyor.
- Save zaten tek kaynak; ek değişiklik gerekmiyor. İstenirse `toggleSave(postId)` alias’ı eklenebilir.

---

## 3) Feed ve PostDetail arasında hangi state kopuk?

| Veri        | Feed                    | PostDetail                 | Durum        |
|------------|--------------------------|----------------------------|-------------|
| **Like**   | `updatePost(next)`       | `updatePost(next)`         | Senkron     |
| **Save**   | `toggleSavedPost`        | `toggleSavedPost`          | Senkron     |
| **Comments** | Post’taki `commentCount` | Yerel `useState(comments)` | Kopuk       |

- Like ve save, `subscribeFeed` ile her iki ekranda da güncel; tek kopukluk **yorumlar**.
- PostDetail yorumları kendi state’inde tutuyor; feed’deki comment sayısı post’tan geliyor, yeni yorum eklenince sayı orada güncellenmiyor ve kalıcı değil.
- Yorumlar da tek kaynakta (serviste) tutulup `addComment(postId, comment)` ile güncellenmeli; comment count post’a yansıtılmalı.

---

## 4) Tek kaynak state nasıl kurulacak?

1. **socialFeedStateService**
   - **toggleLike(postId):** `POST_MAP[postId]` al, `likedByMe` / `likeCount` güncelle, `updatePost(next)` + `emit()`.
   - **Yorumlar:** `COMMENTS: Record<string, SocialComment[]>` (veya postId → comment[]); `addComment(postId, comment)`; post’un `commentCount` ve isteğe bağlı `commentsPreview` güncellenir; `getComments(postId)`.
   - Save tarafı aynı kalır (`toggleSavedPost` / `isPostSaved`).

2. **Feed / PostDetail / Profile grid / Saved**
   - Like: Hepsi `toggleLike(postId)` kullanacak (post’u kendileri güncellemeyecek).
   - Save: Mevcut `toggleSavedPost` / `isPostSaved` kullanımı devam.
   - Comments: PostDetail `getComments(postId)` + `addComment(postId, comment)` kullanacak; feed listesi `subscribeFeed` ile güncel post (commentCount) alacak.

3. **socialFollowService**
   - **Block:** `blockUser(userId)`, `unblockUser(userId)`, `isBlocked(userId)`, `getBlockedIds()`.
   - **Mute:** `muteUser(userId)`, `unmuteUser(userId)`, `isMuted(userId)`.
   - Feed: `getFeedPosts()` / `getPostsByUser()` sonrası blocked kullanıcıları filtrele (veya servis içinde filtrele).
   - Önerilenler: `getSuggestedUsers` blocked’ları çıkarsın.
   - Story rail: Muted kullanıcıları filtrele.

4. **Report (mock)**
   - `reportPost(postId, reason)`, `reportUser(userId, reason)`; reason: spam | fake_account | abuse | other. Şimdilik sadece mock kayıt.

5. **Share**
   - SocialPostCard’da Paylaş’a basınca action sheet: “Profile paylaş”, “Mesaja gönder”, “Linki kopyala”, “Etkinlik paylaş” (event varsa). Paylaşım sonrası `socialNotificationService` tetiklenir.

6. **Bildirimler**
   - Zaten like için Feed’de `addNotification` var. Comment, share, follow, story_reply için de ilgili aksiyon noktalarında `addNotification` çağrılacak.

Bu plan ile like, save, comment tek kaynaktan yönetilir; block/mute/report/share ve bildirimler FAZ 2 hedeflerine uyumlu hale getirilir.
