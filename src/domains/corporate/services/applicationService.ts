// src/domains/corporate/services/applicationService.ts

import { JobApplication } from "../types/application.types";

const MOCK_APPLICATIONS: JobApplication[] = [];

class ApplicationService {
  async apply(app: JobApplication): Promise<void> {
    MOCK_APPLICATIONS.unshift(app);
  }

  async getMyApplications(): Promise<JobApplication[]> {
    return MOCK_APPLICATIONS;
  }
}

export const applicationService = new ApplicationService();