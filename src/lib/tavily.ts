import { TavilyClient } from 'tavily';

const tavilyKey = process.env.TAVILY_API_KEY;

export async function searchTavily(query: string, tags: string[]) {
  if (!tavilyKey) {
    throw new Error('TAVILY_API_KEY missing');
  }
  const client = new TavilyClient({ apiKey: tavilyKey });
  const results = await client.search({
    query,
    topic: 'general',
    time_range: '7d',
    max_results: 5,
  });
  return results.results ?? [];
}
