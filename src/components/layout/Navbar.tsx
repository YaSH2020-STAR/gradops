'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@prisma/client';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stroke bg-dark/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold text-lg text-light">
          GradOps
        </Link>
        <p className="text-xs text-gray3 hidden sm:block">
          Early-career roles only (0–2 years)
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/jobs" className="text-sm text-gray2 hover:text-light">
            Browse Jobs
          </Link>
          {status === 'loading' ? (
            <span className="text-gray3 text-sm">...</span>
          ) : session ? (
            <>
              {session.user?.role === UserRole.JOB_SEEKER && (
                <Link href="/dashboard" className="text-sm text-gray2 hover:text-light">
                  Dashboard
                </Link>
              )}
              {session.user?.role === UserRole.EMPLOYER && (
                <Link href="/employer" className="text-sm text-gray2 hover:text-light">
                  Employer
                </Link>
              )}
              {session.user?.role === UserRole.ADMIN && (
                <Link href="/admin" className="text-sm text-gray2 hover:text-light">
                  Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
