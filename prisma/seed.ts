import { PrismaClient, UserRole, JobSourceType, RemoteType, JobType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const seekerPassword = await hash('seeker123', 12);
  const employerPassword = await hash('employer123', 12);
  const adminPassword = await hash('admin123', 12);

  const seeker = await prisma.user.upsert({
    where: { email: 'seeker@example.com' },
    update: {},
    create: {
      email: 'seeker@example.com',
      passwordHash: seekerPassword,
      role: UserRole.JOB_SEEKER,
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: 'employer@example.com' },
    update: {},
    create: {
      email: 'employer@example.com',
      passwordHash: employerPassword,
      role: UserRole.EMPLOYER,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  await prisma.jobSeekerProfile.upsert({
    where: { userId: seeker.id },
    update: {},
    create: {
      userId: seeker.id,
      name: 'Alex Graduate',
      country: 'USA',
      city: 'San Francisco',
      graduationDate: new Date('2024-06-01'),
      degree: 'BS',
      major: 'Computer Science',
      skills: ['JavaScript', 'React', 'TypeScript'],
    },
  });

  const empProfile = await prisma.employerProfile.upsert({
    where: { userId: employer.id },
    update: {},
    create: {
      userId: employer.id,
      companyName: 'Acme Corp',
      website: 'https://acme.example.com',
      industry: 'Technology',
      size: '50-200',
      hqCountry: 'USA',
    },
  });

  const job1 = await prisma.job.create({
    data: {
      employerId: empProfile.id,
      sourceType: JobSourceType.EMPLOYER_POST,
      sourceName: 'Acme Corp',
      canonicalUrl: 'https://acme.example.com/careers/junior-dev',
      title: 'Junior Software Engineer',
      companyName: 'Acme Corp',
      country: 'USA',
      location: 'San Francisco, CA',
      remoteType: RemoteType.HYBRID,
      jobType: JobType.FULL_TIME,
      salaryMin: 80000,
      salaryMax: 100000,
      salaryCurrency: 'USD',
      description: 'We are looking for a recent graduate to join our engineering team. 0-2 years experience. You will work on our core product with React and Node.js.',
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      preferredSkills: ['TypeScript'],
      experienceMin: 0,
      experienceMax: 2,
      recentGradEligible: true,
      visaSponsorship: false,
      status: 'published',
      postedAt: new Date(),
    },
  });

  await prisma.jobRecentGradScore.create({
    data: {
      jobId: job1.id,
      score: 85,
      reasons: ['0-2 years experience', 'Entry-level title', 'New grad friendly'],
    },
  });

  await prisma.job.create({
    data: {
      employerId: null,
      sourceType: JobSourceType.COMPANY_CAREERS,
      sourceName: 'Tech Startup Inc',
      sourceUrl: 'https://techstartup.io/careers',
      canonicalUrl: 'https://techstartup.io/careers/entry-level',
      title: 'Entry-Level Developer',
      companyName: 'Tech Startup Inc',
      country: 'USA',
      location: 'Remote',
      remoteType: RemoteType.REMOTE,
      jobType: JobType.FULL_TIME,
      description: 'Entry-level role for recent grads. 0-1 year experience.',
      requiredSkills: ['Python', 'SQL'],
      experienceMin: 0,
      experienceMax: 1,
      recentGradEligible: true,
      status: 'published',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const seedJobs: Array<{
    title: string;
    companyName: string;
    country: string;
    location: string;
    remoteType: RemoteType;
    jobType: JobType;
    description: string;
    requiredSkills: string[];
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    sourceName: string;
    canonicalUrl: string;
  }> = [
    {
      title: 'New Grad Software Engineer',
      companyName: 'DataFlow Inc',
      country: 'USA',
      location: 'New York, NY',
      remoteType: RemoteType.HYBRID,
      jobType: JobType.FULL_TIME,
      description: 'Recent graduate role. 0-2 years experience. Build data pipelines and APIs.',
      requiredSkills: ['Java', 'SQL'],
      salaryMin: 75000,
      salaryMax: 95000,
      salaryCurrency: 'USD',
      sourceName: 'DataFlow Careers',
      canonicalUrl: 'https://example.com/jobs/1',
    },
    {
      title: 'Graduate Analyst',
      companyName: 'Finance Co',
      country: 'USA',
      location: 'Chicago, IL',
      remoteType: RemoteType.ONSITE,
      jobType: JobType.FULL_TIME,
      description: 'Ideal for new graduates. 0-1 year experience. Excel, SQL, reporting.',
      requiredSkills: ['Excel', 'SQL'],
      salaryMin: 55000,
      salaryMax: 70000,
      salaryCurrency: 'USD',
      sourceName: 'Finance Co Careers',
      canonicalUrl: 'https://example.com/jobs/2',
    },
    {
      title: 'Junior Frontend Developer',
      companyName: 'WebStudio',
      country: 'USA',
      location: 'Austin, TX',
      remoteType: RemoteType.REMOTE,
      jobType: JobType.FULL_TIME,
      description: 'Entry-level. Recent grads welcome. React, TypeScript, 0-2 years.',
      requiredSkills: ['React', 'TypeScript'],
      salaryMin: 65000,
      salaryMax: 85000,
      salaryCurrency: 'USD',
      sourceName: 'WebStudio Careers',
      canonicalUrl: 'https://example.com/jobs/3',
    },
    {
      title: 'Software Engineering Intern',
      companyName: 'CloudTech',
      country: 'USA',
      location: 'Seattle, WA',
      remoteType: RemoteType.HYBRID,
      jobType: JobType.INTERNSHIP,
      description: 'Summer internship for students or recent grads. AWS, Python.',
      requiredSkills: ['Python'],
      sourceName: 'CloudTech Careers',
      canonicalUrl: 'https://example.com/jobs/4',
    },
    {
      title: 'Associate Consultant',
      companyName: 'Strategy Partners',
      country: 'USA',
      location: 'Boston, MA',
      remoteType: RemoteType.HYBRID,
      jobType: JobType.FULL_TIME,
      description: 'New grad program. 0-2 years. Business analysis, client support.',
      requiredSkills: ['Communication', 'Analysis'],
      salaryMin: 70000,
      salaryMax: 90000,
      salaryCurrency: 'USD',
      sourceName: 'Strategy Partners Careers',
      canonicalUrl: 'https://example.com/jobs/5',
    },
    {
      title: 'Junior Data Scientist',
      companyName: 'AI Labs',
      country: 'USA',
      location: 'San Francisco, CA',
      remoteType: RemoteType.REMOTE,
      jobType: JobType.FULL_TIME,
      description: '0-2 years. Python, ML, statistics. Recent MS/BS grads.',
      requiredSkills: ['Python', 'Machine Learning'],
      salaryMin: 90000,
      salaryMax: 120000,
      salaryCurrency: 'USD',
      sourceName: 'AI Labs Careers',
      canonicalUrl: 'https://example.com/jobs/6',
    },
    {
      title: 'Entry Level Product Designer',
      companyName: 'Design Co',
      country: 'USA',
      location: 'Los Angeles, CA',
      remoteType: RemoteType.HYBRID,
      jobType: JobType.FULL_TIME,
      description: 'Recent grad or 0-2 years. Figma, user research, prototyping.',
      requiredSkills: ['Figma', 'UX'],
      salaryMin: 60000,
      salaryMax: 78000,
      salaryCurrency: 'USD',
      sourceName: 'Design Co Careers',
      canonicalUrl: 'https://example.com/jobs/7',
    },
    {
      title: 'Graduate Mechanical Engineer',
      companyName: 'MechSystems',
      country: 'USA',
      location: 'Detroit, MI',
      remoteType: RemoteType.ONSITE,
      jobType: JobType.FULL_TIME,
      description: 'New grad role. 0-1 year. CAD, testing, documentation.',
      requiredSkills: ['CAD', 'Engineering'],
      salaryMin: 68000,
      salaryMax: 82000,
      salaryCurrency: 'USD',
      sourceName: 'MechSystems Careers',
      canonicalUrl: 'https://example.com/jobs/8',
    },
  ];

  for (const j of seedJobs) {
    const job = await prisma.job.create({
      data: {
        employerId: null,
        sourceType: JobSourceType.COMPANY_CAREERS,
        sourceName: j.sourceName,
        canonicalUrl: j.canonicalUrl,
        title: j.title,
        companyName: j.companyName,
        country: j.country,
        location: j.location,
        remoteType: j.remoteType,
        jobType: j.jobType,
        description: j.description,
        requiredSkills: j.requiredSkills,
        salaryMin: j.salaryMin ?? null,
        salaryMax: j.salaryMax ?? null,
        salaryCurrency: j.salaryCurrency ?? null,
        experienceMin: 0,
        experienceMax: 2,
        recentGradEligible: true,
        status: 'published',
        postedAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.jobRecentGradScore.create({
      data: {
        jobId: job.id,
        score: 70 + Math.floor(Math.random() * 25),
        reasons: ['Entry-level or new grad role', '0-2 years experience'],
      },
    });
  }

  console.log('Seed complete.');
  console.log('Seeker: seeker@example.com / seeker123');
  console.log('Employer: employer@example.com / employer123');
  console.log('Admin: admin@example.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
