import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const schema = z.object({
  companyName: z.string().min(1),
  website: z.union([z.string().url(), z.literal('')]).transform((v) => v || null),
  industry: z.string().nullable(),
  size: z.string().nullable(),
  hqCountry: z.string().nullable(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.EMPLOYER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  await prisma.employerProfile.update({
    where: { userId: uid },
    data: {
      companyName: data.companyName,
      website: data.website,
      industry: data.industry,
      size: data.size,
      hqCountry: data.hqCountry,
    },
  });

  return NextResponse.json({ ok: true });
}
