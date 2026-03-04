/**
 * OpenAI-compatible API client. Set AI_API_KEY and AI_BASE_URL in env.
 * Use any provider: OpenAI, Azure, local LLM, etc.
 */

const getConfig = () => ({
  apiKey: process.env.AI_API_KEY ?? '',
  baseURL: process.env.AI_BASE_URL?.replace(/\/$/, '') ?? 'https://api.openai.com/v1',
});

export async function chatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const { apiKey, baseURL } = getConfig();
  if (!apiKey) throw new Error('AI_API_KEY is not set');

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model ?? 'gpt-4o-mini',
      messages,
      temperature: options?.temperature ?? 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (content == null) throw new Error('AI API returned no content');
  return content;
}
