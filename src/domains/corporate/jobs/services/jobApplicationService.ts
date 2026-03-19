// src/domains/corporate/jobs/services/jobApplicationService.ts
// 🔒 JOB APPLICATION SERVICE (UI-ONLY)
//
// AMAÇ
// - İş başvurusu yönetimi
// - Başvuru geri çekme
// - Başvuruya cevap yazma
// - Şirket başvuruları listeleme
// - Kullanıcı başvuruları listeleme
//
// KURALLAR
// - Backend yok
// - Global state yok
// - Deterministik
// - useCompany veya screen'ler tarafından kullanılabilir
// - UI-only mock veri
// - Duplicate başvuru engellenir

export type JobApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type JobApplication = {
  id: string;

  jobId: string;
  companyId: string;

  applicantUserId: string;
  applicantName: string;

  message: string;

  status: JobApplicationStatus;

  companyReply?: string | null;

  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/* MOCK DATABASE                                                              */
/* -------------------------------------------------------------------------- */

const APPLICATIONS: JobApplication[] = [];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function sortByDateDesc(list: JobApplication[]) {
  return [...list].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/* -------------------------------------------------------------------------- */
/* SERVICE                                                                    */
/* -------------------------------------------------------------------------- */

class JobApplicationService {
  /* ---------------------------------------------------------------------- */
  /* APPLY                                                                  */
  /* ---------------------------------------------------------------------- */

  async apply(
    jobId: string,
    companyId: string,
    applicantUserId: string,
    applicantName: string,
    message: string
  ): Promise<JobApplication> {
    const existing = APPLICATIONS.find(
      (a) =>
        a.jobId === jobId &&
        a.applicantUserId === applicantUserId &&
        a.status !== "withdrawn"
    );

    if (existing) {
      return existing;
    }

    const application: JobApplication = {
      id: `app_${Date.now()}`,

      jobId,
      companyId,

      applicantUserId,
      applicantName,

      message,

      status: "pending",

      companyReply: null,

      createdAt: new Date().toISOString(),
    };

    APPLICATIONS.push(application);

    return application;
  }

  /* ---------------------------------------------------------------------- */
  /* GET COMPANY APPLICATIONS                                               */
  /* ---------------------------------------------------------------------- */

  async getCompanyApplications(companyId: string): Promise<JobApplication[]> {
    const list = APPLICATIONS.filter((a) => a.companyId === companyId);

    return sortByDateDesc(list);
  }

  /* ---------------------------------------------------------------------- */
  /* GET JOB APPLICATIONS                                                   */
  /* ---------------------------------------------------------------------- */

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    const list = APPLICATIONS.filter((a) => a.jobId === jobId);

    return sortByDateDesc(list);
  }

  /* ---------------------------------------------------------------------- */
  /* GET USER APPLICATIONS                                                  */
  /* ---------------------------------------------------------------------- */

  async getUserApplications(userId: string): Promise<JobApplication[]> {
    const list = APPLICATIONS.filter((a) => a.applicantUserId === userId);

    return sortByDateDesc(list);
  }

  /* ---------------------------------------------------------------------- */
  /* GET APPLICATION                                                        */
  /* ---------------------------------------------------------------------- */

  async getApplication(
    applicationId: string
  ): Promise<JobApplication | null> {
    const found = APPLICATIONS.find((a) => a.id === applicationId);

    return found ?? null;
  }

  /* ---------------------------------------------------------------------- */
  /* WITHDRAW                                                               */
  /* ---------------------------------------------------------------------- */

  async withdraw(applicationId: string): Promise<void> {
    const found = APPLICATIONS.find((a) => a.id === applicationId);

    if (!found) return;

    if (found.status !== "pending") return;

    found.status = "withdrawn";
  }

  /* ---------------------------------------------------------------------- */
  /* REPLY                                                                  */
  /* ---------------------------------------------------------------------- */

  async reply(
    applicationId: string,
    replyMessage: string,
    status: "accepted" | "rejected"
  ): Promise<void> {
    const found = APPLICATIONS.find((a) => a.id === applicationId);

    if (!found) return;

    if (found.status === "withdrawn") return;

    found.companyReply = replyMessage;
    found.status = status;
  }

  /* ---------------------------------------------------------------------- */
  /* COUNT                                                                  */
  /* ---------------------------------------------------------------------- */

  async getCompanyApplicationCount(companyId: string): Promise<number> {
    return APPLICATIONS.filter((a) => a.companyId === companyId).length;
  }

  /* ---------------------------------------------------------------------- */
  /* USER APPLIED?                                                          */
  /* ---------------------------------------------------------------------- */

  async hasUserApplied(
    jobId: string,
    userId: string
  ): Promise<boolean> {
    const found = APPLICATIONS.find(
      (a) =>
        a.jobId === jobId &&
        a.applicantUserId === userId &&
        a.status !== "withdrawn"
    );

    return Boolean(found);
  }
}

export const jobApplicationService = new JobApplicationService();