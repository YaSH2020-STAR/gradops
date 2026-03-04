import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { UserRole } from '@prisma/client';
import { JobForm } from '@/components/employer/JobForm';

export default async function NewJobPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  if ((session.user as { role?: string }).role !== UserRole.EMPLOYER) redirect('/');

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-light">Post a job</h1>
        <p className="text-gray2 mt-1">Early-career only (0–2 years experience).</p>
        <JobForm />
      </main>
    </div>
  );
}
