'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Job = {
  id: string;
  title: string;
  country: string;
  location: string | null;
  remoteType: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  description: string;
  requiredSkills: string[];
  status: string;
};

export function JobEditForm({ job }: { job: Job }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(job.title);
  const [country, setCountry] = useState(job.country);
  const [location, setLocation] = useState(job.location ?? '');
  const [remoteType, setRemoteType] = useState(job.remoteType);
  const [jobType, setJobType] = useState(job.jobType);
  const [salaryMin, setSalaryMin] = useState(job.salaryMin?.toString() ?? '');
  const [salaryMax, setSalaryMax] = useState(job.salaryMax?.toString() ?? '');
  const [currency, setCurrency] = useState(job.salaryCurrency ?? 'USD');
  const [description, setDescription] = useState(job.description);
  const [skillsStr, setSkillsStr] = useState(job.requiredSkills.join(', '));
  const [status, setStatus] = useState(job.status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/employer/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        country,
        location: location || null,
        remoteType,
        jobType,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        salaryCurrency: currency,
        description,
        requiredSkills: skillsStr ? skillsStr.split(',').map((s) => s.trim()).filter(Boolean) : [],
        status,
      }),
    });
    setLoading(false);
    if (res.ok) router.push('/employer');
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <Label className="text-gray2">Job title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-gray2">Country *</Label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label className="text-gray2">City / region</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-gray2">Remote type</Label>
          <select
            className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
            value={remoteType}
            onChange={(e) => setRemoteType(e.target.value)}
          >
            <option value="ONSITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>
        <div>
          <Label className="text-gray2">Job type</Label>
          <select
            className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="FULL_TIME">Full-time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
            <option value="PART_TIME">Part-time</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-gray2">Salary min</Label>
          <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-gray2">Salary max</Label>
          <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-gray2">Currency</Label>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-gray2">Description *</Label>
        <textarea
          className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light min-h-[160px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label className="text-gray2">Required skills (comma-separated)</Label>
        <Input
          value={skillsStr}
          onChange={(e) => setSkillsStr(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-gray2">Status</Label>
        <select
          className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save job'}
      </Button>
    </form>
  );
}
