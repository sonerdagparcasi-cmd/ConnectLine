# FAZ 1 – Sosyal Profil Ekranı Raporu

## 1) Değiştirilecek mevcut dosyalar

| Dosya | Değişiklik özeti |
|-------|------------------|
| **SocialProfileContainerScreen.tsx** | Profil üst kartı (avatar ortalanmış, display name, username, bio, şehir, eğitim, çalıştığı yer, website); istatistikler tek satırda hizalı; sekme sistemi POSTS / VIDEOS / EVENTS / SAVED; sahip/ziyaretçi ayrımına göre aksiyonlar (edit profile, add story, create event vs follow, message, share, block, report); tüm metinler i18n; renkler useAppTheme. |
| **useSocialProfile.ts** | stats: posts (feed), events (event service), followers/following (follow service); eventsCount state + socialEventService.getEvents() ile türetme; followingCount için getFollowingCount(); sahip/ziyaretçi aksiyon listesi (ownerActions, visitorActions) döndürme. |
| **socialProfileStore.ts** | displayName alanı eklenebilir (opsiyonel); mevcut yapı korunur. |
| **socialFollowService.ts** | Değişiklik yok (getFollowingCount, getMutualConnections zaten var). İsteğe bağlı: getFollowerCountForUser(userId) başka kullanıcı için – FAZ1’de sadece “me” profil, gerek yok. |
| **socialFeedStateService.ts** | Değişiklik yok; getPostsByUser(userId) zaten kullanılıyor. |
| **socialEventService.ts** | getEventsByUser(userId) ekleme: hostId === userId veya participantList içinde userId olan etkinlikleri döndürme (profil events sayısı ve Events sekmesi için). |
| **social.types.ts** | Gerekirse SocialProfile’a displayName eklenir; store ile uyumlu. |
| **SocialPostCard.tsx** | FAZ1’de değişiklik yok (grid’de sadece medya tıklanıyor, kart kullanılmıyor). |
| **SocialSavedPostsScreen.tsx** | FAZ1’de değişiklik yok. |
| **src/shared/i18n/t.ts** | social.follow, social.followers, social.posts, social.events, social.mutualConnections, social.editProfile; social.following; owner: addStory, createEvent; visitor: message, shareProfile, blockUser, reportUser; tabs: posts, videos, events, saved. |

---

## 2) Kopuk veri akışları

- **followers / following:** Profil ekranı şu an sadece “me” (CURRENT_USER_ID) için. followers store’dan (followerCount), following follow service’ten (getFollowingCount()) alınacak; store’daki followingCount zaten follow service ile senkron.
- **events sayısı:** Bağlı değil. socialEventService.getEvents() var ama kullanıcı bazlı filtre yok. getEventsByUser(userId) eklenecek.
- **Profil grid:** Zaten getPostsByUser(profile.userId) ve getSavedPosts() kullanılıyor; post.authorId yok, post.userId var – filtre userId ile yapılıyor, kopukluk yok.
- **Events sekmesi:** Şu an yok. socialEventService’ten kullanıcının etkinlikleri (host veya katılımcı) getEventsByUser ile beslenecek.

---

## 3) Profil istatistiklerinin bağlanması

| İstatistik | Kaynak | Nasıl |
|------------|--------|--------|
| **posts** | socialFeedStateService | getPostsByUser(profile.userId).length (zaten useSocialProfile’da). |
| **events** | socialEventService | getEventsByUser(profile.userId).length – yeni fonksiyon; getEvents() sonucunu hostId veya participantList ile filtrele. |
| **followers** | socialProfileStore | profileState.followerCount (“me” profili için; store tek profil tutuyor). |
| **following** | socialFollowService | getFollowingCount() (“me” için). |
| **mutual connections** | socialFollowService | getMutualConnections(profile.userId) (zaten kullanılıyor). |

Tümü useSocialProfile içinde toplanıp stats olarak döndürülecek; ekran sadece stats kullanacak.

---

## 4) Grid içeriklerinin hangi servisten geleceği

| Sekme | Veri kaynağı | Not |
|-------|--------------|-----|
| **POSTS** | socialFeedStateService.getPostsByUser(profile.userId) | Kullanıcının tüm gönderileri (userId ile filtre). |
| **VIDEOS** | Aynı liste, client’ta filtre: media içinde type === "video" olanlar. | getPostsByUser(...).filter(p => p.media?.some(m => m.type === "video")). |
| **EVENTS** | socialEventService.getEventsByUser(profile.userId) | Yeni fonksiyon; host veya katılımcı olduğu etkinlikler. |
| **SAVED** | socialFeedStateService.getSavedPosts() | Sadece profil sahibi ise (isOwner); zaten kullanılıyor. |

Yeni dosya açılmayacak; mevcut servisler genişletilerek kullanılacak.
