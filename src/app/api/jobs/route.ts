import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jobSearchQuerySchema } from '@/lib/validations/job';
import { Prisma } from '@prisma/client';

const RECENT_GRAD_MIN_SCORE = 40;

function getParam(sp: URLSearchParams, key: string): string | undefined {
  const v = sp.get(key);
  return v != null && v.trim() !== '' ? v : undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = jobSearchQuerySchema.safeParse({
    q: getParam(searchParams, 'q'),
    country: getParam(searchParams, 'country'),
    city: getParam(searchParams, 'city'),
    remote: getParam(searchParams, 'remote'),
    jobType: getParam(searchParams, 'jobType'),
    datePosted: getParam(searchParams, 'datePosted'),
    salaryMin: searchParams.get('salaryMin') ?? undefined,
    salaryMax: searchParams.get('salaryMax') ?? undefined,
    currency: getParam(searchParams, 'currency'),
    company: getParam(searchParams, 'company'),
    visa: searchParams.get('visa') ?? undefined,
    sort: getParam(searchParams, 'sort'),
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, q, country, city, remote, jobType, datePosted, salaryMin, salaryMax, company, visa, sort } =
    parsed.data;

  const where: Prisma.JobWhereInput = {
    status: 'published',
    recentGradEligible: true,
    AND: [
      { OR: [{ experienceMax: null }, { experienceMax: { lte: 2 } }] },
      { OR: [{ recentGradScore: null }, { recentGradScore: { score: { gte: RECENT_GRAD_MIN_SCORE } } }] },
    ],
  };

  if (country) where.country = { contains: country, mode: 'insensitive' };
  if (city) where.location = { contains: city, mode: 'insensitive' };
  if (remote) where.remoteType = remote;
  if (jobType) where.jobType = jobType;
  if (company) where.companyName = { contains: company, mode: 'insensitive' };
  if (visa !== undefined) where.visaSponsorship = visa;

  if (datePosted) {
    const days = { '24h': 1, '3d': 3, '7d': 7, '14d': 14, '30d': 30 }[datePosted];
    const since = new Date();
    since.setDate(since.getDate() - days);
    where.postedAt = { gte: since };
  }

  if (salaryMin != null) where.salaryMin = { gte: salaryMin };
  if (salaryMax != null) where.salaryMax = { lte: salaryMax };

  if (q?.trim()) {
    where.AND = [
      {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    sort === 'fit'
      ? [{ postedAt: 'desc' }]
      : sort === 'salary'
        ? [{ salaryMax: 'desc' }, { postedAt: 'desc' }]
        : [{ postedAt: 'desc' }];

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        recentGradScore: true,
        employer: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    jobs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
