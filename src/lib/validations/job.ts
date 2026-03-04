import { z } from 'zod';

export const jobSearchQuerySchema = z.object({
  q: z.string().optional(),
  country: z.string().min(1).optional(),
  city: z.string().optional(),
  remote: z.enum(['ONSITE', 'HYBRID', 'REMOTE']).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']).optional(),
  datePosted: z.enum(['24h', '3d', '7d', '14d', '30d']).optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  currency: z.string().optional(),
  company: z.string().optional(),
  visa: z.coerce.boolean().optional(),
  sort: z.enum(['recent', 'fit', 'salary']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type JobSearchQuery = z.infer<typeof jobSearchQuerySchema>;
