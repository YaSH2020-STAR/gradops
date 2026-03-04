import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export default async function EmployerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.EMPLOYER) redirect('/');

  const profile = await prisma.employerProfile.findUnique({
    where: { userId: uid },
    include: { jobs: true },
  });
  if (!profile) redirect('/');

  const published = profile.jobs.filter((j) => j.status === 'published');
  const drafts = profile.jobs.filter((j) => j.status === 'draft');

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light">Employer dashboard</h1>
        <p className="text-gray2 mt-1">{profile.companyName}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/employer/profile">
            <Button variant="outline">Company profile</Button>
          </Link>
          <Link href="/employer/jobs/new">
            <Button>Post a job</Button>
          </Link>
          <Link href="/employer/wellbeing">
            <Button variant="ghost">Wellbeing / Break reminders</Button>
          </Link>
        </div>
        <div className="mt-8">
          <h2 className="font-semibold text-light mb-4">Your jobs</h2>
          {profile.jobs.length === 0 ? (
            <p className="text-gray3">No jobs yet. Post your first job (0–2 years experience only).</p>
          ) : (
            <ul className="space-y-3">
              {published.map((j) => (
                <li key={j.id} className="rounded-xl border border-stroke bg-dark p-4 flex justify-between items-center">
                  <div>
                    <Link href={`/jobs/${j.id}`} className="font-medium text-light hover:text-primary">
                      {j.title}
                    </Link>
                    <p className="text-sm text-gray3">{j.location ?? j.country} · {j.jobType}</p>
                  </div>
                  <Link href={`/employer/jobs/${j.id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </li>
              ))}
              {drafts.map((j) => (
                <li key={j.id} className="rounded-xl border border-stroke bg-dark p-4 flex justify-between items-center opacity-80">
                  <div>
                    <span className="font-medium text-light">{j.title}</span>
                    <span className="ml-2 text-xs text-gray3">Draft</span>
                    <p className="text-sm text-gray3">{j.location ?? j.country}</p>
                  </div>
                  <Link href={`/employer/jobs/${j.id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
