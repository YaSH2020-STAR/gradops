/**
 * Classify a job description for "recent grad fit" (0-100 + reasons).
 * Uses OpenAI-compatible API. Results are cached in JobRecentGradScore.
 */

import { z } from 'zod';
import { chatCompletion } from './client';

const ResponseSchema = z.object({
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()).max(5),
});

export type RecentGradFitResult = z.infer<typeof ResponseSchema>;

const SYSTEM = `You are a classifier for a job board that only shows roles for recent graduates and early-career (0-2 years experience).
Given a job title and description, output a JSON object with:
- score: number 0-100. Higher = better fit for new grads. Consider: entry-level keywords, "0-2 years", "graduate", "junior", "associate", internship, and absence of "senior", "5+ years", "lead".
- reasons: array of 1-5 short strings explaining why (e.g. "Entry-level title", "0-2 years experience required", "New grad program").
Output ONLY valid JSON, no markdown or extra text.`;

export async function classifyRecentGradFit(
  title: string,
  description: string
): Promise<RecentGradFitResult> {
  const text = description.slice(0, 4000);
  const content = await chatCompletion(
    [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `Job title: ${title}\n\nDescription:\n${text}`,
      },
    ],
    { temperature: 0.2 }
  );

  const cleaned = content.replace(/```json?\s*|\s*```/g, '').trim();
  const parsed = JSON.parse(cleaned) as unknown;
  return ResponseSchema.parse(parsed);
}
