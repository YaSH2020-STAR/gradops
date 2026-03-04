/**
 * Adzuna API connector.
 * Legal: Adzuna explicitly allows "Get job ads to display on your own website."
 * See https://developer.adzuna.com/ - Register for app_id and app_key.
 */

import type { JobConnector, ExternalJob, NormalizedJob } from './types';
import { createHash } from 'crypto';

// Set INGESTION_ADZUNA_US_ONLY=true to fetch only USA jobs
const DEFAULT_COUNTRY_CODES = ['us', 'gb'] as const;
const REMOTE_MAP: Record<string, 'ONSITE' | 'HYBRID' | 'REMOTE'> = {
  full_time: 'ONSITE',
  part_time: 'ONSITE',
  contract: 'ONSITE',
  permanent: 'ONSITE',
};
const JOB_TYPE_MAP: Record<string, 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'> = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  contract: 'CONTRACT',
  permanent: 'FULL_TIME',
};

interface AdzunaResult {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
}

export function createAdzunaConnector(): JobConnector {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const enabled =
    process.env.INGESTION_ADZUNA_ENABLED === 'true' && !!appId && !!appKey;

  const usOnly = process.env.INGESTION_ADZUNA_US_ONLY === 'true';
  const countryCodes = usOnly ? (['us'] as const) : DEFAULT_COUNTRY_CODES;
  const maxPages = Math.min(parseInt(process.env.INGESTION_ADZUNA_PAGES ?? '5', 10) || 5, 10);

  return {
    name: 'Adzuna',
    enabled,

    async fetchJobs(): Promise<ExternalJob[]> {
      if (!enabled || !appId || !appKey) return [];

      const all: ExternalJob[] = [];
      const queries = [
        'graduate',
        'entry level',
        'junior',
        'new grad',
        '0-2 years',
        'associate',
        'recent graduate',
        'early career',
        'internship',
      ];

      for (const country of countryCodes) {
        for (const what of queries) {
          for (let page = 1; page <= maxPages; page++) {
            try {
              const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`);
              url.searchParams.set('app_id', appId);
              url.searchParams.set('app_key', appKey);
              url.searchParams.set('results_per_page', '50');
              url.searchParams.set('what', what);
              url.searchParams.set('content-type', 'application/json');

              const res = await fetch(url.toString());
              if (!res.ok) break;
              const data = (await res.json()) as { results?: AdzunaResult[]; count?: number };
              const results = data.results ?? [];
              if (results.length === 0) break;

              for (const r of results) {
                const countryName = country === 'us' ? 'USA' : country === 'gb' ? 'United Kingdom' : String(country).toUpperCase();
                all.push({
                  id: `${country}-${r.id}`,
                  title: r.title ?? '',
                  company: r.company?.display_name ?? 'Unknown',
                  location: r.location?.display_name,
                  country: countryName,
                  url: r.redirect_url ?? `https://www.adzuna.com`,
                  description: r.description ?? '',
                  postedAt: r.created,
                  salary: {
                    min: r.salary_min,
                    max: r.salary_max,
                    currency: country === 'us' ? 'USD' : 'GBP',
                  },
                  contract_time: r.contract_time,
                  contract_type: r.contract_type,
                });
              }
            } catch (e) {
              console.warn(`Adzuna ${country} ${what} p${page}:`, e);
            }
          }
        }
      }

      // Dedupe by id
      const seen = new Set<string>();
      return all.filter((j) => {
        if (seen.has(j.id)) return false;
        seen.add(j.id);
        return true;
      });
    },

    normalize(raw: ExternalJob): NormalizedJob {
      const hash = createHash('sha256')
        .update([raw.company, raw.title, raw.location ?? '', raw.url].join('|'))
        .digest('hex');
      const ct = (raw.contract_time ?? raw.contract_type ?? 'full_time') as string;
      const remoteType = REMOTE_MAP[ct] ?? 'HYBRID';
      const jobType = JOB_TYPE_MAP[ct] ?? 'FULL_TIME';
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
