import { prisma } from './prisma';

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      recentGradScore: true,
      employer: true,
      tags: true,
    },
  });
}
