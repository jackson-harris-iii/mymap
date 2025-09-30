import Parser from 'rss-parser';

const parser = new Parser({ headers: { 'User-Agent': 'my-map/0.1' } });

export async function fetchFeed(url: string) {
  try {
    return await parser.parseURL(url);
  } catch (error) {
    return null;
  }
}
