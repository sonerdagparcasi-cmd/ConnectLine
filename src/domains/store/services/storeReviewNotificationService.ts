export type StoreReviewNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export const storeReviewNotificationService = {
  async getNotifications(): Promise<StoreReviewNotification[]> {
    return [
      {
        id: "N-1",
        title: "Yeni yorum",
        body: "Bir ürününüz için yeni yorum geldi.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
      {
        id: "N-2",
        title: "Yanıt hatırlatma",
        body: "Yanıtlanmamış yorumlarınız var (mock).",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      },
    ];
  },
};