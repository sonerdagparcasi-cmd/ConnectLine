// src/domains/corporate/public/types/public.types.ts

import { JobPost } from "../../recruitment/types/job.types";

export type CompanyPublicProfile = {
  id: string;
  name: string;
  title: string;
  logo?: string;
  about?: string;

  followerCount: number;
  isFollowing: boolean;

  activeJobs: JobPost[];
  announcements: {
    id: string;
    text: string;
    createdAt: number;
  }[];
};