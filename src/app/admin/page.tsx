import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { UserRole } from '@prisma/client';
import { TakedownActions } from '@/components/admin/TakedownActions';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  if ((session.user as { role?: string }).role !== UserRole.ADMIN) redirect('/');

  const takedowns = await prisma.takedownRequest.findMany({
    where: { status: 'PENDING' },
    include: { job: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light">Admin</h1>
        <p className="text-gray2 mt-1">Takedown requests and moderation.</p>
        <section className="mt-8">
          <h2 className="font-semibold text-light mb-4">Pending takedown requests</h2>
          {takedowns.length === 0 ? (
            <p className="text-gray3">No pending requests.</p>
          ) : (
            <ul className="space-y-4">
              {takedowns.map((t) => (
                <li key={t.id} className="rounded-xl border border-stroke bg-dark p-4">
                  <p className="text-sm text-gray2">
                    Job: {t.job.title} @ {t.job.companyName}
                  </p>
                  <p className="text-sm text-gray2">From: {t.requesterEmail}</p>
                  <p className="text-sm text-light mt-1">{t.reason}</p>
                  <TakedownActions requestId={t.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
