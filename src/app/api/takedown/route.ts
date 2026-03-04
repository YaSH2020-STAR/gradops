import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  jobId: z.string(),
  requesterEmail: z.string().email(),
  reason: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { jobId, requesterEmail, reason } = parsed.data;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  await prisma.takedownRequest.create({
    data: { jobId, requesterEmail, reason, status: 'PENDING' },
  });

  return NextResponse.json({ ok: true });
}
