import OpenAI from 'openai';

const primaryModel = 'gpt-5-codex';
const fallbackModel = 'gpt-4o-mini';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function callLLM(system: string, user: string, temperature = 0.2): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing');
  }

  try {
    const res = await client.chat.completions.create({
      model: primaryModel,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
  } catch (err) {
    const res = await client.chat.completions.create({
      model: fallbackModel,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
  }
}

export async function callLLMJson<T>(system: string, user: string): Promise<T> {
  const text = await callLLM(system, user, 0.1);
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error('Failed to parse LLM JSON response');
  }
}
