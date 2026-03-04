'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

function JobsContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [country, setCountry] = useState(searchParams.get('country') ?? '');
  const [remote, setRemote] = useState(searchParams.get('remote') ?? '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') ?? '');
  const [datePosted, setDatePosted] = useState(searchParams.get('datePosted') ?? '');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (country) p.set('country', country);
    if (remote) p.set('remote', remote);
    if (jobType) p.set('jobType', jobType);
    if (datePosted) p.set('datePosted', datePosted);
    p.set('page', String(page));
    p.set('limit', '20');
    return p;
  }, [q, country, remote, jobType, datePosted, page]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/jobs?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setJobs(data.jobs ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        setJobs([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      })
      .finally(() => setLoading(false));
  }, [params.toString()]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (country) p.set('country', country);
    if (remote) p.set('remote', remote);
    if (jobType) p.set('jobType', jobType);
    if (datePosted) p.set('datePosted', datePosted);
    p.set('page', '1');
    p.set('limit', '20');
    fetch(`/api/jobs?${p}`)
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs ?? []);
        setTotal(data.total ?? 0);
        setPage(1);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <p className="text-sm text-gray3 mb-4">
          This platform lists only early-career roles (0–2 years).
        </p>
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 shrink-0">
            <form onSubmit={handleSearch} className="space-y-4 rounded-xl border border-stroke p-4 bg-dark">
              <div>
                <Label className="text-gray2">Keyword</Label>
                <Input
                  placeholder="Title, company..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-gray2">Country</Label>
                <Input
                  placeholder="e.g. USA"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-gray2">Remote</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
                  value={remote}
                  onChange={(e) => setRemote(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">On-site</option>
                </select>
              </div>
              <div>
                <Label className="text-gray2">Job type</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="PART_TIME">Part-time</option>
                </select>
              </div>
              <div>
                <Label className="text-gray2">Posted</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="3d">Last 3 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="14d">Last 14 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Apply filters
              </Button>
            </form>
          </aside>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray2">{total} jobs</span>
              <select
                className="rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
                defaultValue="recent"
              >
                <option value="recent">Most recent</option>
                <option value="fit">Best recent-grad fit</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            {loading ? (
              <p className="text-gray3">Loading...</p>
            ) : error ? (
              <div className="rounded-xl border border-stroke bg-dark p-6 text-center">
                <p className="text-primary font-medium">Couldn&apos;t load jobs</p>
                <p className="text-sm text-gray2 mt-2">{error}</p>
                <p className="text-sm text-gray3 mt-4">
                  From the <strong>gradops</strong> folder run: <code className="bg-stroke px-2 py-1 rounded">npm run db:setup</code> (and ensure Postgres is running, e.g. <code className="bg-stroke px-2 py-1 rounded">docker compose up -d</code>).
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-xl border border-stroke bg-dark p-6 text-center">
                <p className="text-gray2">No jobs yet.</p>
                <p className="text-sm text-gray3 mt-2">
                  Add sample jobs: open a terminal, go to the <strong>gradops</strong> project folder, then run
                </p>
                <pre className="mt-3 text-left bg-darkBg border border-stroke rounded-lg p-4 text-sm text-gray2 overflow-x-auto">
                  npm run db:setup
                </pre>
                <p className="text-sm text-gray3 mt-2">
                  Or enable <a href="https://developer.adzuna.com" className="text-primary hover:underline">Adzuna</a> in .env and run <code className="bg-stroke px-1 rounded">npm run ingest</code>.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <JobCard job={job} />
                  </li>
                ))}
              </ul>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-darkBg">
        <Navbar />
        <main className="container mx-auto px-4 py-6"><p className="text-gray3">Loading...</p></main>
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}
