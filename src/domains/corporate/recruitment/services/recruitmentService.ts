// src/domains/corporate/recruitment/services/recruitmentService.ts

import { ApplicationStatus, JobApplication } from "../types/application.types";

/**
 * 🔒 Recruitment Service (UI MOCK)
 * ------------------------------------
 * - SADECE JobApplication üretir
 * - AI alanı içermez
 * - Ranking / score yapmaz
 * - Backend varsayımı YOK
 */

const STORE: JobApplication[] = [
  {
    id: "a1",
    jobId: "job-1",
    jobTitle: "Frontend Developer",

    candidateId: "u1",
    candidateName: "Ahmet Yılmaz",

    status: "new",
    appliedAt: Date.now() - 2 * 60 * 60_000,

    portfolioUrl: "https://portfolio.example",
  },
  {
    id: "a2",
    jobId: "job-1",
    jobTitle: "Frontend Developer",

    candidateId: "u2",
    candidateName: "Zeynep Kaya",

    status: "reviewing",
    appliedAt: Date.now() - 10 * 60 * 60_000,
  },
  {
    id: "a3",
    jobId: "job-1",
    jobTitle: "Frontend Developer",

    candidateId: "u3",
    candidateName: "Mehmet Demir",

    status: "shortlisted",
    appliedAt: Date.now() - 26 * 60 * 60_000,
  },
  {
    id: "a4",
    jobId: "job-1",
    jobTitle: "Frontend Developer",

    candidateId: "u4",
    candidateName: "Ayşe Çelik",

    status: "rejected",
    appliedAt: Date.now() - 30 * 60 * 60_000,
  },
];

class RecruitmentService {
  async listApplications(jobId?: string): Promise<JobApplication[]> {
    if (!jobId) return [...STORE];
    return STORE.filter((a) => a.jobId === jobId);
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus
  ): Promise<void> {
    const app = STORE.find((x) => x.id === applicationId);
    if (app) app.status = status;
  }

  async getById(applicationId: string): Promise<JobApplication | null> {
    return STORE.find((x) => x.id === applicationId) ?? null;
  }
}

export const recruitmentService = new RecruitmentService();