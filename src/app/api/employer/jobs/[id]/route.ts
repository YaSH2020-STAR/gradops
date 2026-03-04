import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { RemoteType, JobType } from '@prisma/client';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  location: z.string().nullable().optional(),
  remoteType: z.enum(['ONSITE', 'HYBRID', 'REMOTE']).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']).optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().nullable().optional(),
  description: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'unpublished']).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.EMPLOYER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const profile = await prisma.employerProfile.findUnique({ where: { userId: uid } });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 400 });

  const job = await prisma.job.findFirst({
    where: { id, employerId: profile.id },
  });
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  await prisma.job.update({
    where: { id },
    data: {
      ...(data.title != null && { title: data.title }),
      ...(data.country != null && { country: data.country }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.remoteType != null && { remoteType: data.remoteType as RemoteType }),
      ...(data.jobType != null && { jobType: data.jobType as JobType }),
      ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
      ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
      ...(data.salaryCurrency !== undefined && { salaryCurrency: data.salaryCurrency }),
      ...(data.description != null && { description: data.description }),
      ...(data.requiredSkills != null && { requiredSkills: data.requiredSkills }),
      ...(data.status != null && { status: data.status }),
    },
  });

  return NextResponse.json({ ok: true });
}
