# FAZ 4 – Keşfet, Video Akışı, Öneri Sistemi Raporu

## 1) Explore ekranı şu an hangi verileri kullanıyor?

- **Kaynak:** `getFeedPosts()` (socialFeedStateService) ile timeline postları alınıyor; eğer boşsa `MOCK_POSTS` kullanılıyor.
- **Sıralama:** Ekranda yerel bir `score()` fonksiyonu var: `likeCount * 3 + commentCount * 4 + freshness` (yaşa göre bonus). Bu sıralamayla tek bir grid gösteriliyor.
- **Bölüm yok:** Trending / videolar / önerilen kişiler / etkinlikler / hashtag ayrımı yok; hepsi tek grid.
- **Sonuç:** Veri tek kaynaktan (state service + mock fallback) geliyor ama bölümlere ayrılmıyor ve trend skoru state service ile ortak değil.

---

## 2) Trending içerikler nasıl türetilecek?

- **Mevcut:** `socialFeedService` içinde `calculateTrendScore` (like * 3, comment * 5, recency) ve `getTrendingPosts()` (MOCK_POSTS üzerinden, ilk 10) zaten var. `socialFeedStateService` ise `getExplorePosts()` ile rastgele karıştırıyor; trend skoru kullanılmıyor.
- **Plan:** Tek kaynak state service olsun. `socialFeedStateService` içinde:
  - `getTrendingPosts(limit?)`: `getAllPosts()` alır, aynı trend formülü (like, comment, recency) ile sıralar, `limit` kadar döner.
  - `getTrendingVideos(limit?)`: `getAllPosts()` içinden `media.some(m => m.type === "video")` olanları filtreler, aynı trend skoru ile sıralar, `limit` kadar döner.
- Böylece hem Explore hem video akışı aynı post havuzundan beslenir; yeni mimari eklenmez.

---

## 3) Video postlar feed içinde nasıl ayrılacak?

- **Ayrım:** Postta `media` array’inde en az bir öğe `type === "video"` ise video post sayılacak. Kısa video listesi: `getTrendingVideos()` veya `getAllPosts().filter(p => hasVideo(p))`.
- **SocialPostCard:** Video varsa (örn. `media[0]?.type === "video"`):
  - Thumbnail üzerinde play overlay (play ikonu).
  - Süre badge’i: `media[0].durationSec` (örn. "0:12").
  - Mute state sadece tam ekran video ekranında; kartta opsiyonel gösterilebilir.
  - Mevcut like/comment/share ikonları aynı kalacak; mimari değişmeyecek.
- **Short video akışı:** Ayrı bir ekran (örn. SocialVideoFeedScreen): dikey tam ekran liste, sadece video postlar, görünen öğede otomatik oynatma, mute/unmute, like/comment/share/follow. Veri: `getTrendingVideos()` veya benzeri.

---

## 4) Suggested user sistemi hangi verilerden üretilecek?

- **Mevcut:** `socialFollowService.getSuggestedUsers(limit)` var. `getAllUsers()` MOCK_POSTS’taki post yazarlarından türetiliyor; kendisi, takip edilenler ve engellenenler eleniyor; ilk `limit` döndürülüyor.
- **Zenginleştirme:** Aynı fonksiyon kalsın; kartta “X ortak bağlantı” için `getMutualConnections(userId)` kullanılacak. İsteğe bağlı: dönen listeyi mutual sayısına göre sıralayıp en çok ortak bağlantılıları öne almak (şimdilik UI’da sıralama da yapılabilir).
- **Same city / school / events:** Mock veride kullanıcı için city/school alanı yok; eklenmeden bu kriterler kullanılamaz. FAZ 4’te sadece “takip edilmeyen + engelli değil + mutual count” ile yetinilebilir; ileride profil alanları eklenirse genişletilir.

---

## Uygulama özeti

1. **socialFeedStateService:** `getTrendingPosts(limit)`, `getTrendingVideos(limit)` ekle; trend skoru socialFeedService’teki formülle uyumlu (veya oradan tek bir helper import et).
2. **socialFeedService:** Gerekirse `getTrendingPosts`’u state service’i kullanan bir wrapper yap veya Explore doğrudan state service’i kullansın; çakışma olmasın.
3. **Explore ekranı:** Bölümler: Trending posts (grid), Trending videos (grid + “Tümünü gör” → video feed), Suggested people (yatay kartlar, follow), Events near you (socialEventService.getEvents()), Hashtag discovery (caption’lardan çıkarılan #etiketler). Loading/empty state.
4. **Hashtag:** Tüm post caption’ları taranıp # ile başlayan kelimeler toplanacak; yeni servis yok, feed/state serviste yardımcı fonksiyon veya Explore içinde useMemo.
5. **SocialPostCard:** Video medya varsa play overlay + duration badge; tema uyumlu.
6. **SocialVideoFeedScreen:** Yeni ekran; dikey video listesi, autoplay, mute, like/comment/share/follow; navigator’a ekle.
7. **SuggestedUserCard:** Avatar, isim, kullanıcı adı, mutual count, follow butonu; Explore ve profil altında (en fazla 5).
8. **i18n ve tema:** Yeni anahtarlar; tüm yeni UI `useAppTheme()`.
