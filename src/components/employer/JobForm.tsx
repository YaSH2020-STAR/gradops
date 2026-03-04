'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function JobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [remoteType, setRemoteType] = useState('HYBRID');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [visa, setVisa] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/employer/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        country,
        location: location || undefined,
        remoteType,
        jobType,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        salaryCurrency: currency,
        description,
        requiredSkills: skillsStr ? skillsStr.split(',').map((s) => s.trim()).filter(Boolean) : [],
        preferredSkills: [],
        experienceMax: 2,
        visaSponsorship: visa,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Failed to create job');
      return;
    }
    router.push(`/employer/jobs/${data.id}/edit`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg p-2">{error}</p>
      )}
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
          placeholder="JavaScript, React, Python"
          className="mt-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="visa"
          checked={visa}
          onChange={(e) => setVisa(e.target.checked)}
          className="rounded border-stroke text-primary"
        />
        <Label htmlFor="visa" className="text-gray2">Visa sponsorship available</Label>
      </div>
      <p className="text-xs text-gray3">Experience range is fixed to 0–2 years for this platform.</p>
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create job (draft)'}
      </Button>
    </form>
  );
}
