import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ saved: false });
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string })?.role !== UserRole.JOB_SEEKER) {
    return NextResponse.json({ saved: false });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ saved: false });

  const saved = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: uid, jobId } },
  });

  return NextResponse.json({ saved: !!saved });
}
