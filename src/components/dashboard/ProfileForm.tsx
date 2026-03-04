'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Profile = {
  id: string;
  name: string | null;
  country: string | null;
  city: string | null;
  graduationDate: Date | string | null;
  degree: string | null;
  major: string | null;
  skills: string[];
  workAuthorization: string | null;
  visaNeeds: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name ?? '');
  const [country, setCountry] = useState(profile.country ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [gradDate, setGradDate] = useState(
    profile.graduationDate
      ? (typeof profile.graduationDate === 'string'
          ? profile.graduationDate.slice(0, 10)
          : profile.graduationDate.toISOString().slice(0, 10))
      : ''
  );
  const [degree, setDegree] = useState(profile.degree ?? '');
  const [major, setMajor] = useState(profile.major ?? '');
  const [skillsStr, setSkillsStr] = useState(profile.skills.join(', '));
  const [workAuth, setWorkAuth] = useState(profile.workAuthorization ?? '');
  const [visaNeeds, setVisaNeeds] = useState(profile.visaNeeds ?? '');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    const res = await fetch('/api/seeker/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || null,
        country: country || null,
        city: city || null,
        graduationDate: gradDate || null,
        degree: degree || null,
        major: major || null,
        skills: skillsStr ? skillsStr.split(',').map((s) => s.trim()).filter(Boolean) : [],
        workAuthorization: workAuth || null,
        visaNeeds: visaNeeds || null,
      }),
    });
    setSaving(false);
    if (res.ok) setDone(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-gray2">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-gray2">Country</Label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-gray2">City</Label>
        <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label className="text-gray2">Graduation date</Label>
        <Input
          type="date"
          value={gradDate}
          onChange={(e) => setGradDate(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-gray2">Degree</Label>
          <Input value={degree} onChange={(e) => setDegree(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-gray2">Major</Label>
          <Input value={major} onChange={(e) => setMajor(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-gray2">Skills (comma-separated)</Label>
        <Input
          value={skillsStr}
          onChange={(e) => setSkillsStr(e.target.value)}
          placeholder="JavaScript, React, Python"
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-gray2">Work authorization (optional)</Label>
        <Input value={workAuth} onChange={(e) => setWorkAuth(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label className="text-gray2">Visa needs (optional)</Label>
        <Input value={visaNeeds} onChange={(e) => setVisaNeeds(e.target.value)} className="mt-1" />
      </div>
      {done && <p className="text-sm text-primary">Profile saved.</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  );
}
