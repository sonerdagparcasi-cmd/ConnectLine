export type CorporateIdentityKind = "individual" | "company";

export type CorporateCompanyRole = "OWNER" | "HR" | "EDITOR" | "VIEWER";

export type CorporateContext =
  | {
      kind: "individual";
      individualProfileId: string;
      displayName?: string;
      title?: string;
      activeApplicationsCount?: number;
      profileCompleteness?: number; // 0..100
    }
  | {
      kind: "company";
      companyId: string;
      companyName: string;
      role: CorporateCompanyRole;
      activeJobsCount?: number;
      newApplicationsCount?: number;
      followersCount?: number;
    };

export type CorporateFeedItem =
  | {
      id: string;
      type: "job";
      title: string;
      companyName: string;
      locationText: string;
      jobTypeText?: string;
      createdAt: number;
      tagText?: string; // "Sana uygun" gibi telifsiz etiket
    }
  | {
      id: string;
      type: "announcement";
      companyName: string;
      title: string;
      summary: string;
      createdAt: number;
    }
  | {
      id: string;
      type: "event";
      companyName: string;
      title: string;
      dateText: string;
      locationText?: string;
      createdAt: number;
    };

export type CorporateHomeData = {
  context: CorporateContext;
  recommended: CorporateFeedItem[]; // bireysel ağırlıklı
  feed: CorporateFeedItem[]; // genel akış
};