import type { APIRoute } from 'astro';
import { getComments, createComment } from '../../../lib/db';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const comments = getComments(slug);
    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get comments:', error);
    return new Response(JSON.stringify({ error: 'Failed to get comments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, authorName, content, parentId } = body;

    if (!slug || !authorName || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic validation
    if (authorName.length > 50 || content.length > 5000) {
      return new Response(JSON.stringify({ error: 'Content too long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const comment = createComment(slug, authorName.trim(), content.trim(), parentId);
    return new Response(JSON.stringify(comment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return new Response(JSON.stringify({ error: 'Failed to create comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
