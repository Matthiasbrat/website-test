import type { APIRoute } from 'astro';
import { getReactions, toggleReaction } from '../../lib/db';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  const anonymousId = url.searchParams.get('anonymousId');

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await getReactions(slug, anonymousId || undefined);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get reactions:', error);
    return new Response(JSON.stringify({ error: 'Failed to get reactions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, emoji, anonymousId } = body;

    if (!slug || !emoji || !anonymousId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await toggleReaction(slug, emoji, anonymousId);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to toggle reaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to toggle reaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
