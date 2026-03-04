import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { UserRole } from '@prisma/client';
import { BreakReminderSettingsForm } from '@/components/dashboard/BreakReminderSettingsForm';

export default async function EmployerWellbeingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.EMPLOYER) redirect('/');

  const settings = await prisma.breakReminderSettings.findUnique({
    where: { userId: uid },
  });
  const state = await prisma.breakReminderState.findUnique({
    where: { userId: uid },
  });

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-2xl font-bold text-light">Wellbeing / Break reminders</h1>
        <p className="text-gray2 mt-1">
          Opt in to get reminded to take short breaks. We only store your preferences.
        </p>
        <BreakReminderSettingsForm userId={uid} settings={settings} state={state} />
      </main>
    </div>
  );
}
