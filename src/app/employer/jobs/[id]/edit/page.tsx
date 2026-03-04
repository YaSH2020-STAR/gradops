import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { UserRole } from '@prisma/client';
import { JobEditForm } from '@/components/employer/JobEditForm';

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.EMPLOYER) redirect('/');

  const { id } = await params;
  const profile = await prisma.employerProfile.findUnique({ where: { userId: uid } });
  if (!profile) redirect('/employer');

  const job = await prisma.job.findFirst({
    where: { id, employerId: profile.id },
  });
  if (!job) notFound();

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-light">Edit job</h1>
        <p className="text-gray2 mt-1">{job.title}</p>
        <JobEditForm job={job} />
      </main>
    </div>
  );
}
