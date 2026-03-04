import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserRole } from '@prisma/client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  if ((session.user as { role?: string }).role !== UserRole.JOB_SEEKER) redirect('/employer');

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light">Dashboard</h1>
        <p className="text-gray2 mt-1">Manage your profile, saved jobs, and applications.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/profile">
            <div className="rounded-xl border border-stroke bg-dark p-6 hover:border-gray3 transition-colors">
              <h2 className="font-semibold text-light">Profile</h2>
              <p className="text-sm text-gray2 mt-1">Edit your info, skills, resume</p>
            </div>
          </Link>
          <Link href="/dashboard/saved-jobs">
            <div className="rounded-xl border border-stroke bg-dark p-6 hover:border-gray3 transition-colors">
              <h2 className="font-semibold text-light">Saved jobs</h2>
              <p className="text-sm text-gray2 mt-1">Your bookmarks</p>
            </div>
          </Link>
          <Link href="/dashboard/applications">
            <div className="rounded-xl border border-stroke bg-dark p-6 hover:border-gray3 transition-colors">
              <h2 className="font-semibold text-light">Applications</h2>
              <p className="text-sm text-gray2 mt-1">Track interest and applications</p>
            </div>
          </Link>
          <Link href="/dashboard/alerts">
            <div className="rounded-xl border border-stroke bg-dark p-6 hover:border-gray3 transition-colors">
              <h2 className="font-semibold text-light">Job alerts</h2>
              <p className="text-sm text-gray2 mt-1">Saved searches & notifications</p>
            </div>
          </Link>
          <Link href="/dashboard/wellbeing">
            <div className="rounded-xl border border-stroke bg-dark p-6 hover:border-gray3 transition-colors">
              <h2 className="font-semibold text-light">Wellbeing</h2>
              <p className="text-sm text-gray2 mt-1">Break reminders</p>
            </div>
          </Link>
        </div>
        <div className="mt-8">
          <Link href="/jobs">
            <Button>Browse jobs</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
