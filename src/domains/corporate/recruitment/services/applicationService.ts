import { ApplicationStatus, JobApplication } from "../types/application.types";

/**
 * 🔒 ApplicationService (UI-ONLY / MOCK)
 *
 * KURALLAR:
 * - Recruitment domain izolasyonu korunur
 * - Backend varsayımı YOK
 * - Mevcut methodlar bozulmaz
 * - Global başvurular için listAll EKLENİR
 */
class ApplicationService {
  private apps: JobApplication[] = [];

  /* -------------------------------------------------- */
  /* APPLY                                              */
  /* -------------------------------------------------- */

  async apply(app: JobApplication): Promise<JobApplication> {
    this.apps.unshift(app);
    return app;
  }

  /* -------------------------------------------------- */
  /* LIST BY JOB (MEVCUT – DEĞİŞMEDİ)                   */
  /* -------------------------------------------------- */

  async list(jobId: string): Promise<JobApplication[]> {
    return this.apps.filter((a) => a.jobId === jobId);
  }

  /* -------------------------------------------------- */
  /* LIST ALL (YENİ – GLOBAL BAŞVURULAR)                */
  /* -------------------------------------------------- */

  async listAll(): Promise<JobApplication[]> {
    return [...this.apps];
  }

  /* -------------------------------------------------- */
  /* UPDATE STATUS                                      */
  /* -------------------------------------------------- */

  async updateStatus(
    appId: string,
    status: ApplicationStatus
  ): Promise<void> {
    this.apps = this.apps.map((a) =>
      a.id === appId ? { ...a, status } : a
    );
  }
}

export const applicationService = new ApplicationService();