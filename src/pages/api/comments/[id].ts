import type { APIRoute } from 'astro';
import { updateComment, deleteComment } from '../../../lib/db';
import { auth } from '../../../lib/auth';

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;

    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Missing content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await updateComment(id!, session.user.id, content);
    if (!result) {
      return new Response(JSON.stringify({ error: 'Comment not found or not authorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update comment:', error);
    return new Response(JSON.stringify({ error: 'Failed to update comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await deleteComment(id!, session.user.id);
    if (!result) {
      return new Response(JSON.stringify({ error: 'Comment not found or not authorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
