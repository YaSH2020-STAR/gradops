import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { JobCard } from '@/components/jobs/JobCard';
import { UserRole } from '@prisma/client';

export default async function SavedJobsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.JOB_SEEKER) redirect('/');

  const saved = await prisma.savedJob.findMany({
    where: { userId: uid },
    include: {
      job: {
        include: { recentGradScore: true },
      },
    },
  });

  const jobs = saved.map((s) => s.job).filter((j) => j.status === 'published');

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light">Saved jobs</h1>
        <p className="text-gray2 mt-1">Your bookmarked listings.</p>
        {jobs.length === 0 ? (
          <p className="text-gray3 mt-8">No saved jobs yet. Browse and save jobs you like.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
