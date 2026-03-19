# Sosyal Domain İyileştirme Planı

## 1. Hangi mevcut dosyalarda ne güçlendirilecek

### SocialProfileContainerScreen.tsx
- **Profil istatistikleri**: `stats.followers`, `stats.posts` gerçek akışa bağlanacak (şu an store + sabit 12 post).
- **Grid/saved veri**: `gridPosts`, `videoPosts`, `savedPosts` MOCK_POSTS yerine `socialFeedStateService.getPostsByUser()` ve `getSavedPosts()` ile beslenecek.
- **Follow butonu**: `socialFollowService.toggleFollow` kullanılıyor; store ile senkron (follow sonrası store.followerCount güncellemesi) sağlanacak.
- **Hardcoded metinler**: "Takipçi", "Gönderi", "Etkinliklerim", "ortak bağlantı", "Takibi Bırak", "Takip Et" → i18n.
- **Tema**: Sabit "#fff", gradient renkleri → T (useAppTheme) ile tutarlı kullanım.

### useSocialProfile.ts
- **stats.posts**: Sabit 12 kaldırılacak; `socialFeedStateService.getPostsByUser(profileUserId)` (veya store üzerinden) ile gerçek sayı.
- **Follow state**: `profileState.isFollowing` / `followerCount` ile `socialFollowService` tek kaynak olacak şekilde bağlanacak (store, follow service ile senkron).
- **CURRENT_USER_ID**: Tek yerde tanım (store veya follow service ile aynı sabit).

### socialProfileStore.ts
- **Follow senkron**: `follow()` / `unfollow()` çağrıldığında `socialFollowService.followUser` / `unfollowUser` da çağrılacak; veya tam tersi: profil ekranı sadece follow service kullanacak, store sadece profil alanları (avatar, bio, vb.) tutacak.
- **FollowerCount**: Follow service’ten gelen sayı ile güncellenebilir (getFollowerCount / getFollowingCount).

### socialFollowService.ts
- **Profil store senkron**: `followUser` / `unfollowUser` sonrası `socialProfileStore.setFollowerCount` (veya store’un follow state’i) güncellenecek; böylece profil ekranı tek kaynaktan beslenir.
- **CURRENT_USER_ID**: `socialProfileStore` veya merkezi bir sabit ile aynı olmalı.

### SocialFeedScreen.tsx
- **Save state**: Yerel `savedMap` kaldırılacak; `socialFeedStateService.isPostSaved(postId)` ve `toggleSavedPost` tek kaynak olacak; subscribeFeed ile liste güncellenecek.
- **Like state**: Like feed state’te tutulacak (socialFeedStateService’e like/saved genişlemesi veya mevcut POST_MAP güncellemesi).
- **Hardcoded**: "Paylaş", "Etkinliklerim", "Düzenle", "Gizle", "Herkese Aç", "İptal", "gönderini beğendi" → i18n.
- **Tema**: Tüm renkler T üzerinden.

### SocialPostDetailScreen.tsx
- **Post verisi**: `postId` ile post `socialFeedStateService` (veya getFeedPosts/getAllPosts) üzerinden alınacak; başlık/kullanıcı/medya gerçek post’tan.
- **Like/saved**: Yerel `liked` state kaldırılacak; post’un `likedByMe` ve feed state’teki saved bilgisi kullanılacak; toggle’da feed state güncellenecek.
- **Hardcoded**: "Gönderi", "Beğen", "Yorum", "Yorum yaz...", "Kullanıcı Adı", "Post", "Yorum" → i18n.
- **HEART_COLOR**: T.accent veya tema rengi.

### SocialSavedPostsScreen.tsx
- **Zaten** `getSavedPosts` / `toggleSavedPost` / `subscribeFeed` kullanıyor; sadece boş metin "Kaydedilmiş gönderi bulunamadı" → i18n.
- **onToggleLike**: Şu an boş; feed state’ten like senkronu eklenebilir (opsiyonel, tek kaynak sonrası).

### SocialPostCard.tsx
- **Zaman**: `getTimeAgo` "şimdi", "dk", "sa", "gün" → i18n.
- **musicText**: Sabit "#888" → T.mutedText.
- **Diğer**: Sadece tema ve i18n tutarlılığı.

### socialStoryStateService.ts
- **Mevcut API**: markStoryViewed, replies, reactions kalacak; story create tarafı yeni story’i buraya ekleyecek tek bir “addStory” benzeri nokta ile bağlanabilir (opsiyonel).

### SocialStoryViewerScreen.tsx
- **Veri**: MOCK_STORIES yerine `socialStoryStateService` veya tek story listesi (create’ten gelen + mock) ile beslenebilir.
- **Hardcoded**: Tüm buton/label metinleri i18n.
- **Tema**: T kullanımı standart.

### SocialCreateStoryScreen.tsx
- **Akış**: "Story Oluştur" / "Paylaş" şu an sadece goBack; medya seçimi ve editor’e geçiş (SocialCreateStoryEditorScreen) tek akışta birleştirilebilir.
- **Metin**: "Story Oluştur", "Paylaş" → i18n.

### SocialCreateStoryEditorScreen.tsx
- **Paylaşım**: onShare sonrası gerçek paylaşım (story state / listeye ekleme) bağlanacak; navigation goBack + state güncellemesi.
- **Hardcoded**: "Hikâye hazır", "Herkese Açık", "Gizli", "Metin", "Müzik" vb. → i18n.
- **Visibility**: social.types.SocialVisibility ile uyum.

### SocialExploreScreen.tsx
- **Zaten** getFeedPosts / getExplorePosts kullanıyor; explorePosts useMemo dependency’si düzeltilebilir (subscribe ile güncel veri).
- **Başlık**: "Keşfet" → i18n.

### socialNotificationService.ts
- **Mevcut**: API yerinde; kullanılan metinler ("sen", "gönderini beğendi") Feed’den geliyor → i18n ile değiştirilebilir.

### social.types.ts
- **Değişiklik yok** (sadece referans); gerekirse yorumlar güncellenir.

---

## 2. State kopuklukları (hangi dosyalar arasında)

| Kaynak | Hedef | Kopukluk |
|--------|--------|----------|
| **socialFollowService** (FOLLOWING) | **socialProfileStore** (isFollowing, followerCount) | Profil ekranı followService.toggleFollow + subscribe kullanıyor; store.follow/unfollow ve store.followerCount ayrı. Takip et sonrası store güncellenmiyor. |
| **SocialFeedScreen** (savedMap – yerel state) | **socialFeedStateService** (SAVED) | Feed’de kaydet butonu yerel savedMap’i güncelliyor; SocialSavedPostsScreen getSavedPosts/toggleSavedPost kullanıyor. İkisi senkron değil. |
| **SocialFeedScreen** (posts state – like toggle) | **socialFeedStateService** (POST_MAP) | Like tıklanınca sadece yerel setPosts ile güncelleniyor; updatePost çağrılmıyor. Detail ekranı kendi liked state’ine sahip; feed’deki like ile senkron değil. |
| **SocialPostDetailScreen** (liked, comments – yerel) | **Feed / socialFeedStateService** | Detail’e postId ile gidiliyor; post verisi çekilmiyor, like/comment state feed ile paylaşılmıyor. |
| **SocialProfileContainerScreen** (gridPosts, savedPosts) | **socialFeedStateService** / **socialFollowService** | Grid MOCK_POSTS; saved MOCK slice. getPostsByUser(profile.userId) ve getSavedPosts kullanılmıyor. |
| **useSocialProfile** (stats.posts = 12) | **socialFeedStateService.getPostsByUser** | Post sayısı sabit; gerçek sayı yok. |
| **SocialCreateStoryScreen** / **Editor** | **socialStoryStateService** / story listesi | Create/Editor paylaşım sonrası story listesine ekleme yok; viewer MOCK_STORIES kullanıyor. |

---

## 3. İlk güvenli uygulama sırası

1. **i18n hazırlığı (sosyal anahtarlar)**  
   - `src/shared/i18n/t.ts` içinde `social.*` anahtarlarını ekle (profil: takipçi, gönderi, takip et, takibi bırak; feed: paylaş, kaydet, beğen, yorum; story: oluştur, paylaş; genel: keşfet, kaydedilenler, boş durumlar).  
   - Hiçbir ekran davranışı değişmez; sadece key’ler hazır olur.

2. **Save/Like tek kaynak (socialFeedStateService)**  
   - Feed’de `savedMap` kaldır; `isPostSaved(postId)` ve `toggleSavedPost` kullan; `subscribeFeed` ile listeyi yenile.  
   - Like için: Feed’de toggle like yapıldığında `updatePost` ile POST_MAP’i güncelle (likedByMe, likeCount).  
   - Böylece feed ↔ feed state tek kaynak olur.

3. **SocialSavedPostsScreen save senkronu**  
   - Zaten service kullanıyor; sadece boş metni i18n yap.  
   - (Opsiyonel) Kart’ta onToggleLike’ı feed state’ten gelen like ile bağla.

4. **SocialPostDetailScreen – post verisi + like/saved**  
   - postId ile `getAllPosts` / getPostById benzeri ile postu al; başlık/kullanıcı/medya buradan.  
   - Like/saved state’i post + feed state’ten oku; toggle’da `updatePost` / `toggleSavedPost` çağır; subscribeFeed ile güncel kalmak (parent’ta state varsa).

5. **Follow – store ve socialFollowService senkronu**  
   - `socialFollowService.followUser(userId)` / `unfollowUser(userId)` içinde, mevcut kullanıcı profili görüntüleniyorsa (userId = store’daki profile.userId) `socialProfileStore` followerCount / isFollowing güncellensin.  
   - Veya: Profil ekranında sadece follow service kullanılmaya devam etsin; useSocialProfile’da `stats.followers` için `socialFollowService.getFollowerCount()` (veya profil userId için getFollowerCount) kullanılsın; store’daki followerCount kaldırılabilir veya service’ten set edilir.

6. **useSocialProfile – stats.posts gerçek**  
   - `stats.posts`: `socialFeedStateService.getPostsByUser(targetUserId).length` (veya store’dan türetilmiş bir sayı).  
   - `stats.followers` / `following`: socialFollowService’ten veya store’dan (senkron sonrası).

7. **SocialProfileContainerScreen – grid/saved gerçek**  
   - gridPosts: `socialFeedStateService.getPostsByUser(profile.userId)`.  
   - savedPosts: `getSavedPosts()` filtresi (sadece kendi kaydettiklerim) veya mevcut getSavedPosts.  
   - Tab’lar (grid/video/saved) aynı kalır; veri kaynağı değişir.  
   - Metinleri i18n’e çevir; tema T kullan.

8. **Profil ekranı follow butonu tek kaynak**  
   - Butonda hâlâ `toggleFollow(profile.userId)` kullan; subscribe ile `following` state’i güncel.  
   - Store’un follow()/unfollow() ile service’i senkron tut (yukarıdaki adım 5 ile).

9. **Story create + viewer tek mantık**  
   - Create/Editor’da “Paylaş” sonrası MOCK_STORIES’e veya socialStoryStateService’e (veya global story listesine) yeni story ekle.  
   - Viewer’da MOCK_STORIES yerine bu listeyi kullan (veya mock + create’ten gelenler birleşik).  
   - Story create ekranlarındaki metinleri i18n yap.

10. **Tema standardizasyonu**  
    - Tüm sosyal ekranlarda sabit renk (#fff, #888, HEART_COLOR vb.) kaldırılıp T (useAppTheme) ile değiştirilecek.

11. **Hardcoded metinlerin i18n’e taşınması**  
    - Yukarıdaki adımlarda açılan tüm ekranlarda kalan sabit metinler `t('social....')` ile değiştirilecek.

Bu sıra, mevcut mimariyi bozmadan önce state’i tek kaynağa toplar, sonra profil ve story akışını bağlar, en sonda i18n ve temayı tamamlar.
