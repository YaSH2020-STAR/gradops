import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RemoteType, JobType } from '@prisma/client';
import { ReportJobButton } from '@/components/jobs/ReportJobButton';
import { SaveJobButton } from '@/components/jobs/SaveJobButton';

const remoteLabel: Record<RemoteType, string> = {
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};

const jobTypeLabel: Record<JobType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};

import { getJobById } from '@/lib/jobs';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job || job.status !== 'published') notFound();

  const score = job.recentGradScore?.score;
  const reasons = (job.recentGradScore?.reasons as string[]) ?? [];
  const fitLabel = score != null ? (score >= 70 ? 'Great fit' : score >= 50 ? 'Good fit' : 'Possible fit') : 'Early-career role';

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/jobs" className="text-sm text-gray3 hover:text-primary mb-6 inline-block">
          ← Back to jobs
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-light">{job.title}</h1>
            <p className="text-gray2 mt-1">{job.companyName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SaveJobButton jobId={job.id} />
            <Badge className="bg-primary/20 text-primary border-0">{fitLabel}</Badge>
            <Button asChild>
              <a href={job.canonicalUrl} target="_blank" rel="noopener noreferrer">
                Apply
              </a>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray3">
          <span>{remoteLabel[job.remoteType]}</span>
          <span>{jobTypeLabel[job.jobType]}</span>
          {job.location && <span>{job.location}</span>}
          {job.country && <span>{job.country}</span>}
        </div>
        {(job.salaryMin != null || job.salaryMax != null) && (
          <p className="text-gray2 mt-2">
            {job.salaryCurrency ?? ''} {job.salaryMin?.toLocaleString() ?? '—'} – {job.salaryMax?.toLocaleString() ?? '—'}
          </p>
        )}
        <div className="mt-6 rounded-xl border border-stroke bg-dark p-4">
          <h2 className="font-semibold text-light mb-2">Recent grad fit</h2>
          <p className="text-sm text-gray2">
            {reasons.length > 0
              ? reasons.join(' ')
              : 'This role is marked as suitable for 0–2 years experience.'}
          </p>
        </div>
        <div className="mt-6">
          <h2 className="font-semibold text-light mb-2">Description</h2>
          <div
            className="prose prose-invert prose-sm max-w-none text-gray2"
            dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-stroke pt-6">
          <span className="text-sm text-gray3">
            Source: {job.sourceName}
            {job.sourceUrl && (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline"
              >
                Original
              </a>
            )}
          </span>
          <ReportJobButton jobId={job.id} />
        </div>
      </main>
    </div>
  );
}
