import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { UserRole } from '@prisma/client';

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  if ((session.user as { role?: string }).role !== UserRole.JOB_SEEKER) redirect('/');

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light">Job alerts</h1>
        <p className="text-gray2 mt-1">Saved searches and email alerts (coming soon).</p>
      </main>
    </div>
  );
}
