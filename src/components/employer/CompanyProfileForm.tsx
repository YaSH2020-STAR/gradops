'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Profile = {
  companyName: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  hqCountry: string | null;
};

export function CompanyProfileForm({ profile }: { profile: Profile }) {
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [website, setWebsite] = useState(profile.website ?? '');
  const [industry, setIndustry] = useState(profile.industry ?? '');
  const [size, setSize] = useState(profile.size ?? '');
  const [hqCountry, setHqCountry] = useState(profile.hqCountry ?? '');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    const res = await fetch('/api/employer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: companyName || profile.companyName,
        website: website || null,
        industry: industry || null,
        size: size || null,
        hqCountry: hqCountry || null,
      }),
    });
    setSaving(false);
    if (res.ok) setDone(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <Label className="text-gray2">Company name *</Label>
        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label className="text-gray2">Website</Label>
        <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label className="text-gray2">Industry</Label>
        <Input value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label className="text-gray2">Company size</Label>
        <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 50-200" className="mt-1" />
      </div>
      <div>
        <Label className="text-gray2">HQ country</Label>
        <Input value={hqCountry} onChange={(e) => setHqCountry(e.target.value)} className="mt-1" />
      </div>
      {done && <p className="text-sm text-primary">Profile saved.</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  );
}
