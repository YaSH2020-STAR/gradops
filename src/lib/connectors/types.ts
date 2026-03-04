/**
 * Connector types for job ingestion.
 * Only use sources that explicitly allow programmatic access.
 * Operators must confirm ToS for each source before enabling.
 */

export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location?: string;
  country: string;
  url: string;
  description: string;
  postedAt?: string;
  remote?: 'onsite' | 'hybrid' | 'remote';
  jobType?: string;
  salary?: { min?: number; max?: number; currency?: string };
  [key: string]: unknown;
}

export interface NormalizedJob {
  externalId: string;
  title: string;
  companyName: string;
  country: string;
  location: string | null;
  remoteType: 'ONSITE' | 'HYBRID' | 'REMOTE';
  jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  description: string;
  canonicalUrl: string;
  sourceUrl: string | null;
  postedAt: Date;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  contentHash: string;
}

export interface JobConnector {
  name: string;
  enabled: boolean;
  fetchJobs(): Promise<ExternalJob[]>;
  normalize(job: ExternalJob): NormalizedJob;
}
