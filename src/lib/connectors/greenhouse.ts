/**
 * Greenhouse job board JSON connector.
 * DISABLED BY DEFAULT. Enable only after confirming Greenhouse ToS allow
 * programmatic access for your use case. See: https://www.greenhouse.io/terms
 */

import type { JobConnector, ExternalJob, NormalizedJob } from './types';
import { createHash } from 'crypto';

const REMOTE_MAP = { onsite: 'ONSITE' as const, hybrid: 'HYBRID' as const, remote: 'REMOTE' as const };
const JOB_TYPE_MAP: Record<string, 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'> = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  internship: 'INTERNSHIP',
  contract: 'CONTRACT',
};

export function createGreenhouseConnector(boardToken: string): JobConnector {
  const enabled = process.env.INGESTION_GREENHOUSE_ENABLED === 'true';
  const name = 'Greenhouse';

  return {
    name,
    enabled,

    async fetchJobs(): Promise<ExternalJob[]> {
      if (!enabled) return [];
      const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const jobs = (data.jobs ?? []).map((j: { id: string; title: string; location: { name: string }; absolute_url: string }) => ({
        id: String(j.id),
        title: j.title,
        company: data.board?.name ?? 'Company',
        location: j.location?.name,
        country: 'USA',
        url: j.absolute_url,
        description: '',
      }));
      for (const job of jobs) {
        const detailRes = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${job.id}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          job.description = detail.content ?? '';
        }
      }
      return jobs;
    },

    normalize(raw: ExternalJob): NormalizedJob {
      const hash = createHash('sha256')
        .update([raw.company, raw.title, raw.location ?? '', raw.url].join('|'))
        .digest('hex');
      const remoteType = raw.remote ? REMOTE_MAP[raw.remote] ?? 'HYBRID' : 'HYBRID';
      const jobType = raw.jobType ? JOB_TYPE_MAP[String(raw.jobType).toLowerCase()] ?? 'FULL_TIME' : 'FULL_TIME';
      return {
        externalId: raw.id,
        title: raw.title,
        companyName: raw.company,
        country: raw.country ?? 'USA',
        location: raw.location ?? null,
        remoteType,
        jobType,
        description: raw.description ?? '',
        canonicalUrl: raw.url,
        sourceUrl: raw.url,
        postedAt: raw.postedAt ? new Date(raw.postedAt) : new Date(),
        salaryMin: raw.salary?.min ?? null,
        salaryMax: raw.salary?.max ?? null,
        salaryCurrency: raw.salary?.currency ?? null,
        contentHash: hash,
      };
    },
  };
}
