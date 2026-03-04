'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@prisma/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'JOB_SEEKER' | 'EMPLOYER'>('JOB_SEEKER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Signup failed');
        setLoading(false);
        return;
      }
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: role === 'JOB_SEEKER' ? '/dashboard' : '/employer',
      });
      if (signInRes?.ok) {
        window.location.href = signInRes.url ?? (role === 'JOB_SEEKER' ? '/dashboard' : '/employer');
        return;
      }
      setError('Account created. Please sign in.');
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-md border-stroke bg-dark">
          <CardHeader>
            <CardTitle className="text-light">Create account</CardTitle>
            <p className="text-sm text-gray2">Choose your account type (you can’t change this later)</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 rounded-lg p-2">{error}</p>
              )}
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'JOB_SEEKER'}
                      onChange={() => setRole('JOB_SEEKER')}
                      className="rounded border-stroke text-primary"
                    />
                    <span className="text-sm text-gray2">Job Seeker (Recent Grad)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'EMPLOYER'}
                      onChange={() => setRole('EMPLOYER')}
                      className="rounded border-stroke text-primary"
                    />
                    <span className="text-sm text-gray2">Employer / Recruiter</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (min 8 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
            <p className="text-center text-sm text-gray3">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
