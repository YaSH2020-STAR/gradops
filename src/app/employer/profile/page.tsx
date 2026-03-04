import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { UserRole } from '@prisma/client';
import { CompanyProfileForm } from '@/components/employer/CompanyProfileForm';

export default async function EmployerProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.EMPLOYER) redirect('/');

  const profile = await prisma.employerProfile.findUnique({
    where: { userId: uid },
  });
  if (!profile) redirect('/employer');

  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-light">Company profile</h1>
        <p className="text-gray2 mt-1">Update your company details.</p>
        <CompanyProfileForm profile={profile} />
      </main>
    </div>
  );
}
