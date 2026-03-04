import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type Job = {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  remoteType: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  sourceName: string;
  sourceType: string;
  recentGradScore?: { score: number; reasons: unknown } | null;
};

const remoteLabel: Record<string, string> = {
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};

export function JobCard({ job }: { job: Job }) {
  const score = job.recentGradScore?.score;
  const fitLabel = score != null ? (score >= 70 ? 'Great fit' : score >= 50 ? 'Good fit' : 'Possible fit') : null;

  return (
    <Link href={`/jobs/${job.id}`}>
      <article className="block rounded-xl border border-stroke bg-dark p-5 hover:border-gray3 transition-colors">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-light">{job.title}</h3>
            <p className="text-sm text-gray2 mt-0.5">{job.companyName}</p>
          </div>
          {fitLabel && (
            <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
              {fitLabel}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray3">
          <span>{remoteLabel[job.remoteType] ?? job.remoteType}</span>
          <span>·</span>
          <span>{jobTypeLabel[job.jobType] ?? job.jobType}</span>
          {job.location && (
            <>
              <span>·</span>
              <span>{job.location}</span>
            </>
          )}
        </div>
        {(job.salaryMin != null || job.salaryMax != null) && (
          <p className="text-sm text-gray2 mt-2">
            {job.salaryMin != null && job.salaryMax != null
              ? `${job.salaryCurrency ?? ''} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
              : job.salaryMin != null
                ? `From ${job.salaryCurrency ?? ''} ${job.salaryMin.toLocaleString()}`
                : `Up to ${job.salaryCurrency ?? ''} ${job.salaryMax!.toLocaleString()}`}
          </p>
        )}
        <p className="text-xs text-gray3 mt-2">Source: {job.sourceName}</p>
      </article>
    </Link>
  );
}
