import { CorporateContext, CorporateFeedItem, CorporateHomeData } from "../types/corporate.types";

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function nowMinus(minutes: number) {
  return Date.now() - minutes * 60_000;
}

class CorporateHomeService {
  getHomeData(context: CorporateContext): CorporateHomeData {
    const recommended: CorporateFeedItem[] =
      context.kind === "individual"
        ? [
            {
              id: makeId("job"),
              type: "job",
              title: "Mobil Uygulama Geliştirici",
              companyName: "Teknoloji Ekibi",
              locationText: "İstanbul / Hibrit",
              jobTypeText: "Tam zamanlı",
              createdAt: nowMinus(30),
              tagText: "Sana uygun",
            },
            {
              id: makeId("job"),
              type: "job",
              title: "Ürün Analisti",
              companyName: "Ürün Organizasyonu",
              locationText: "Remote",
              jobTypeText: "Tam zamanlı",
              createdAt: nowMinus(120),
              tagText: "Öneri",
            },
          ]
        : [];

    const feed: CorporateFeedItem[] = [
      ...(context.kind === "company"
        ? [
            {
              id: makeId("announcement"),
              type: "announcement",
              companyName: context.companyName,
              title: "Yeni ilan yayında",
              summary: "İlan detaylarını güncellemeyi unutma.",
              createdAt: nowMinus(15),
            } as CorporateFeedItem,
            {
              id: makeId("event"),
              type: "event",
              companyName: context.companyName,
              title: "Kurumsal etkinlik",
              dateText: "Bu hafta",
              locationText: "Online",
              createdAt: nowMinus(240),
            } as CorporateFeedItem,
          ]
        : [
            {
              id: makeId("announcement"),
              type: "announcement",
              companyName: "Şirketler",
              title: "Yeni duyurular",
              summary: "Takip ettiğin şirketlerden yeni gelişmeler var.",
              createdAt: nowMinus(45),
            } as CorporateFeedItem,
          ]),
      {
        id: makeId("job"),
        type: "job",
        title: "Backend Geliştirici",
        companyName: "Platform Takımı",
        locationText: "Ankara / Remote",
        jobTypeText: "Tam zamanlı",
        createdAt: nowMinus(300),
        tagText: "Yeni",
      },
    ];

    return { context, recommended, feed };
  }
}

export const corporateHomeService = new CorporateHomeService();