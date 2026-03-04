import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { JobSourceType, RemoteType, JobType } from '@prisma/client';

const createSchema = z.object({
  title: z.string().min(1),
  country: z.string().min(1),
  location: z.string().optional(),
  remoteType: z.enum(['ONSITE', 'HYBRID', 'REMOTE']),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  description: z.string().min(1),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  experienceMax: z.number().min(0).max(2).default(2),
  visaSponsorship: z.boolean().default(false),
  industry: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uid = (session.user as { id?: string }).id;
  if (!uid || (session.user as { role?: string }).role !== UserRole.EMPLOYER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const profile = await prisma.employerProfile.findUnique({ where: { userId: uid } });
  if (!profile) return NextResponse.json({ error: 'Employer profile not found' }, { status: 400 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const job = await prisma.job.create({
    data: {
      employerId: profile.id,
      sourceType: JobSourceType.EMPLOYER_POST,
      sourceName: profile.companyName,
      canonicalUrl: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/jobs`,
      title: data.title,
      companyName: profile.companyName,
      country: data.country,
      location: data.location ?? null,
      remoteType: data.remoteType as RemoteType,
      jobType: data.jobType as JobType,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      salaryCurrency: data.salaryCurrency ?? null,
      description: data.description,
      requiredSkills: data.requiredSkills,
      preferredSkills: data.preferredSkills,
      experienceMin: 0,
      experienceMax: data.experienceMax,
      recentGradEligible: true,
      visaSponsorship: data.visaSponsorship,
      industry: data.industry ?? null,
      status: 'draft',
      postedAt: new Date(),
    },
  });

  return NextResponse.json(job);
}
