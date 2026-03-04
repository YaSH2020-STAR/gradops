import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  enabled: z.boolean(),
  intervalMinutes: z.number().min(15).max(120),
  quietHoursStart: z.number().min(0).max(23),
  quietHoursEnd: z.number().min(0).max(23),
  message: z.string(),
  idleThresholdMinutes: z.number().min(1).max(30),
  snoozeMinutesDefault: z.number().min(5).max(60),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uid = (session.user as { id?: string }).id;
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.breakReminderSettings.upsert({
    where: { userId: uid },
    create: {
      userId: uid,
      ...parsed.data,
    },
    update: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uid = (session.user as { id?: string }).id;
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await prisma.breakReminderSettings.findUnique({
    where: { userId: uid },
  });
  const state = await prisma.breakReminderState.findUnique({
    where: { userId: uid },
  });

  return NextResponse.json({ settings, state });
}
