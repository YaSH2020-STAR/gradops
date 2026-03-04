import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as { role?: string }).role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const formData = await _req.formData();
  const action = formData.get('action') === 'approve' ? 'approve' : 'reject';

  const req = await prisma.takedownRequest.findUnique({
    where: { id },
    include: { job: true },
  });
  if (!req) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (req.status !== 'PENDING') {
    return NextResponse.json({ error: 'Already resolved' }, { status: 400 });
  }

  if (action === 'approve') {
    await prisma.job.update({
      where: { id: req.jobId },
      data: { status: 'unpublished' },
    });
  }

  await prisma.takedownRequest.update({
    where: { id },
    data: { status: action === 'approve' ? 'APPROVED' : 'REJECTED', resolvedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
