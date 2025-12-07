import type { APIRoute } from 'astro';
import { search } from '../../lib/search';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q');
  const type = url.searchParams.get('type') as 'blog' | 'docs' | undefined;

  if (!query) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await search(query, { type, limit: 10 });

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
