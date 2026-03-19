// src/domains/corporate/jobs/services/corporateJobService.ts
// 🔒 UI-ONLY MOCK SERVICE (FINAL & LOCKED)
//
// KURALLAR (KİLİTLİ):
// - Job domain feed domain’e DOKUNMAZ
// - CorporateFeedPost KULLANILMAZ
// - Feed mutation YOK
// - UI-only, backend varsayımı YOK

import type { CorporateJob, JobApplication } from "../types/job.types";

/* ------------------------------------------------------------------ */
/* UTILS                                                              */
/* ------------------------------------------------------------------ */

function makeId() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2);
}

/* ------------------------------------------------------------------ */
/* MOCK STORES (IN-MEMORY)                                             */
/* ------------------------------------------------------------------ */

const JOBS: CorporateJob[] = [
  {
    id: "j1",
    companyId: "c1",
    companyName: "ConnectLine Tech",
    title: "Frontend Developer",
    description: "React / TypeScript deneyimli.",
    location: "İstanbul",
    jobType: "full_time",
    salaryRange: "40k–70k",
    skills: ["React", "TypeScript", "UI"],
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
  },
];

const APPLICATIONS: JobApplication[] = [];

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

class CorporateJobService {
  /* ============================== JOBS ============================== */

  async listJobs(): Promise<CorporateJob[]> {
    return [...JOBS].sort((a, b) => b.createdAt - a.createdAt);
  }

  async getAllJobs(): Promise<CorporateJob[]> {
    return this.listJobs();
  }

  async getJob(jobId: string): Promise<CorporateJob | null> {
    return JOBS.find((j) => j.id === jobId) ?? null;
  }

  /**
   * 🔒 Job create
   * - SADECE job oluşturur
   * - Feed ile HİÇBİR ilişkisi yok
   */
  async createJob(
    payload: Omit<CorporateJob, "id" | "createdAt">
  ): Promise<CorporateJob> {
    const job: CorporateJob = {
      ...payload,
      id: makeId(),
      createdAt: Date.now(),
    };

    JOBS.unshift(job);
    return job;
  }

  /* ========================== APPLICATIONS ========================== */

  /**
   * 🔒 Candidate Apply
   * - UI-only başvuru kaydı
   * - Backend varsayımı yok
   */
  async applyJob(
    payload: Omit<JobApplication, "id" | "createdAt">
  ): Promise<JobApplication> {
    const app: JobApplication = {
      ...payload,
      id: makeId(),
      createdAt: Date.now(),
    };

    APPLICATIONS.push(app);
    return app;
  }

  /**
   * 🔒 ADIM 7.1 — Candidate "Başvurularım" için TEK OKUMA NOKTASI
   * Bireysel kullanıcının yaptığı başvuruları listelemek için
   */
  getAllApplications(): JobApplication[] {
    // dışarıya referans sızdırma: kopya dön
    return [...APPLICATIONS].sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 🔒 Employer Inbox
   * Firma sahibine gelen başvurular
   */
  getApplicationsByCompany(companyId: string): JobApplication[] {
    const companyJobIds = JOBS.filter((j) => j.companyId === companyId).map(
      (j) => j.id
    );

    return APPLICATIONS.filter((a) => companyJobIds.includes(a.jobId)).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }
}

/* ------------------------------------------------------------------ */
/* EXPORT                                                             */
/* ------------------------------------------------------------------ */

export const corporateJobService = new CorporateJobService();