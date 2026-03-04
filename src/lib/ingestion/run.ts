/**
 * Run job ingestion from enabled connectors.
 * Used by: npm run ingest (script) and POST /api/cron/ingest (automated cron).
 */

import { prisma } from '@/lib/prisma';
import { JobSourceType } from '@prisma/client';
import { createAdzunaConnector } from '@/lib/connectors/adzuna';
import { createGreenhouseConnector } from '@/lib/connectors/greenhouse';
import { classifyRecentGradFit } from '@/lib/ai/classifyRecentGradFit';

const AI_BATCH_SIZE = 30;

type NormalizedJob = ReturnType<ReturnType<typeof createAdzunaConnector>['normalize']>;

async function saveJob(
  norm: NormalizedJob,
  sourceType: JobSourceType,
  sourceName: string
) {
  const existing = await prisma.job.findFirst({
    where: {
      sourceType,
      sourceName,
      externalId: norm.externalId,
    },
    include: { recentGradScore: true },
  });

  if (existing) {
    if (existing.contentHash !== norm.contentHash) {
      await prisma.job.update({
        where: { id: existing.id },
        data: {
          title: norm.title,
          description: norm.description,
          location: norm.location,
          remoteType: norm.remoteType,
          jobType: norm.jobType,
          salaryMin: norm.salaryMin,
          salaryMax: norm.salaryMax,
          salaryCurrency: norm.salaryCurrency,
          contentHash: norm.contentHash,
          updatedAt: new Date(),
        },
      });
    }
    return { created: false, updated: existing.contentHash !== norm.contentHash, jobId: existing.id };
  }

  const job = await prisma.job.create({
    data: {
      employerId: null,
      sourceType,
      sourceName,
      sourceUrl: norm.sourceUrl,
      canonicalUrl: norm.canonicalUrl,
      externalId: norm.externalId,
      title: norm.title,
      companyName: norm.companyName,
      country: norm.country,
      location: norm.location,
      remoteType: norm.remoteType,
      jobType: norm.jobType,
      description: norm.description,
      salaryMin: norm.salaryMin,
      salaryMax: norm.salaryMax,
      salaryCurrency: norm.salaryCurrency,
      experienceMin: 0,
      experienceMax: 2,
      recentGradEligible: true,
      status: 'published',
      postedAt: norm.postedAt,
      contentHash: norm.contentHash,
    },
  });
  return { created: true, updated: false, jobId: job.id };
}

async function scoreJobWithAI(jobId: string, title: string, description: string) {
  if (!process.env.AI_API_KEY) return;
  try {
    const result = await classifyRecentGradFit(title, description);
    await prisma.jobRecentGradScore.upsert({
      where: { jobId },
      create: {
        jobId,
        score: result.score,
        reasons: result.reasons,
        modelVersion: '1',
      },
      update: {
        score: result.score,
        reasons: result.reasons,
        modelVersion: '1',
      },
    });
  } catch (e) {
    console.warn(`AI score failed for job ${jobId}:`, e);
  }
}

export async function runIngestion(): Promise<{ created: number; updated: number }> {
  let totalCreated = 0;
  let totalUpdated = 0;

  const adzuna = createAdzunaConnector();
  if (adzuna.enabled) {
    const raw = await adzuna.fetchJobs();
    for (const r of raw) {
      const norm = adzuna.normalize(r);
      const { created, updated, jobId } = await saveJob(norm, JobSourceType.LICENSED_FEED, 'Adzuna');
      if (created) totalCreated++;
      if (updated) totalUpdated++;
      if (created && process.env.AI_API_KEY) {
        await scoreJobWithAI(jobId, norm.title, norm.description);
      }
    }
  }

  if (process.env.INGESTION_CRON_ENABLED === 'true') {
    const boardToken = process.env.GREENHOUSE_BOARD_TOKEN ?? '';
    const greenhouse = createGreenhouseConnector(boardToken);
    if (greenhouse.enabled) {
      const raw = await greenhouse.fetchJobs();
      for (const r of raw) {
        const norm = greenhouse.normalize(r);
        const { created, updated, jobId } = await saveJob(norm, JobSourceType.GREENHOUSE, greenhouse.name);
        if (created) totalCreated++;
        if (updated) totalUpdated++;
        if (created && process.env.AI_API_KEY) {
          await scoreJobWithAI(jobId, norm.title, norm.description);
        }
      }
    }
  }

  if (process.env.AI_API_KEY) {
    const withoutScore = await prisma.job.findMany({
      where: { recentGradScore: null },
      take: AI_BATCH_SIZE,
    });
    for (const job of withoutScore) {
      await scoreJobWithAI(job.id, job.title, job.description);
    }
  }

  return { created: totalCreated, updated: totalUpdated };
}
