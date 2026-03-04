import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const schema = z.object({
  name: z.string().nullable(),
  country: z.string().nullable(),
  city: z.string().nullable(),
  graduationDate: z.string().nullable(),
  degree: z.string().nullable(),
  major: z.string().nullable(),
  skills: z.array(z.string()),
  workAuthorization: z.string().nullable(),
  visaNeeds: z.string().nullable(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.JOB_SEEKER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  await prisma.jobSeekerProfile.update({
    where: { userId: uid },
    data: {
      name: data.name,
      country: data.country,
      city: data.city,
      graduationDate: data.graduationDate ? new Date(data.graduationDate) : null,
      degree: data.degree,
      major: data.major,
      skills: data.skills,
      workAuthorization: data.workAuthorization,
      visaNeeds: data.visaNeeds,
    },
  });

  return NextResponse.json({ ok: true });
}
