import { Pool } from 'pg';

// Create database pool
const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/matthias_docs',
});

export { pool };

// Initialize database tables
export async function initDatabase() {
  const client = await pool.connect();

  try {
    // Comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_slug VARCHAR(500) NOT NULL,
        user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted BOOLEAN DEFAULT FALSE
      );

      CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
      CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
    `);

    // Reactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_slug VARCHAR(500) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        anonymous_id VARCHAR(100),
        user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_slug, emoji, anonymous_id),
        UNIQUE(post_slug, emoji, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_reactions_post_slug ON reactions(post_slug);
    `);

    console.log('Database tables initialized');
  } finally {
    client.release();
  }
}

// Comment operations
export async function getComments(postSlug: string) {
  const result = await pool.query(`
    SELECT
      c.id,
      c.post_slug as "postSlug",
      c.user_id as "userId",
      c.parent_id as "parentId",
      c.content,
      c.created_at as "createdAt",
      c.updated_at as "updatedAt",
      u.name as "userName",
      u.image as "userImage"
    FROM comments c
    LEFT JOIN "user" u ON c.user_id = u.id
    WHERE c.post_slug = $1 AND c.deleted = FALSE
    ORDER BY c.created_at ASC
  `, [postSlug]);

  return result.rows.map(row => ({
    ...row,
    user: row.userName ? { name: row.userName, image: row.userImage } : null,
  }));
}

export async function createComment(
  postSlug: string,
  userId: string,
  content: string,
  parentId?: string
) {
  const result = await pool.query(`
    INSERT INTO comments (post_slug, user_id, content, parent_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, created_at as "createdAt"
  `, [postSlug, userId, content, parentId || null]);

  return result.rows[0];
}

export async function updateComment(id: string, userId: string, content: string) {
  const result = await pool.query(`
    UPDATE comments
    SET content = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3 AND deleted = FALSE
    RETURNING id
  `, [content, id, userId]);

  return result.rows[0];
}

export async function deleteComment(id: string, userId: string) {
  const result = await pool.query(`
    UPDATE comments
    SET deleted = TRUE, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [id, userId]);

  return result.rows[0];
}

// Reaction operations
export async function getReactions(postSlug: string, anonymousId?: string) {
  // Get counts
  const countsResult = await pool.query(`
    SELECT emoji, COUNT(*) as count
    FROM reactions
    WHERE post_slug = $1
    GROUP BY emoji
  `, [postSlug]);

  const counts: Record<string, number> = {};
  countsResult.rows.forEach(row => {
    counts[row.emoji] = parseInt(row.count);
  });

  // Get user's reactions
  let userReactions: string[] = [];
  if (anonymousId) {
    const userResult = await pool.query(`
      SELECT emoji FROM reactions
      WHERE post_slug = $1 AND anonymous_id = $2
    `, [postSlug, anonymousId]);
    userReactions = userResult.rows.map(r => r.emoji);
  }

  return { counts, userReactions };
}

export async function toggleReaction(
  postSlug: string,
  emoji: string,
  anonymousId: string
) {
  // Check if reaction exists
  const existing = await pool.query(`
    SELECT id FROM reactions
    WHERE post_slug = $1 AND emoji = $2 AND anonymous_id = $3
  `, [postSlug, emoji, anonymousId]);

  if (existing.rows.length > 0) {
    // Remove reaction
    await pool.query(`
      DELETE FROM reactions WHERE id = $1
    `, [existing.rows[0].id]);
  } else {
    // Add reaction
    await pool.query(`
      INSERT INTO reactions (post_slug, emoji, anonymous_id)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `, [postSlug, emoji, anonymousId]);
  }

  return getReactions(postSlug, anonymousId);
}
