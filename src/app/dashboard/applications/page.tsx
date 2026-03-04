import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { UserRole } from '@prisma/client';

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.JOB_SEEKER) redirect('/');

  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId: uid } });
  if (!profile) redirect('/dashboard');

  const applications = await prisma.applicationTracker.findMany({
    where: { userId: uid },
    include: { job: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light">Applications</h1>
        <p className="text-gray2 mt-1">Track your applications and interest.</p>
        {applications.length === 0 ? (
          <p className="text-gray3 mt-8">No applications yet.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {applications.map((a) => (
              <li key={a.id} className="rounded-xl border border-stroke bg-dark p-4">
                <Link href={`/jobs/${a.jobId}`} className="font-medium text-light hover:text-primary">
                  {a.job.title} at {a.job.companyName}
                </Link>
                <p className="text-sm text-gray3 mt-1">Status: {a.status}</p>
                {a.notes && <p className="text-sm text-gray2 mt-1">{a.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
