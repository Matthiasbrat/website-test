/**
 * Build search index at build time
 * Generates a JSON file with all searchable content
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

/**
 * Load topic metadata from _topic.yaml
 */
function loadTopicMetadata(type, topicSlug) {
  try {
    const topicPath = path.join(rootDir, 'src/content', type, topicSlug, '_topic.yaml');
    const content = fs.readFileSync(topicPath, 'utf-8');

    // Simple YAML parser for basic key-value pairs
    const lines = content.split('\n');
    const metadata = {};
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        metadata[match[1]] = match[2].trim();
      }
    }
    return metadata;
  } catch {
    return null;
  }
}

/**
 * Strip MDX/HTML tags and clean content for indexing
 */
function cleanContent(content) {
  return content
    // Remove import statements
    .replace(/^import\s+.+$/gm, '')
    // Remove JSX/HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // Remove inline code
    .replace(/`[^`]+`/g, ' ')
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown headers markers
    .replace(/^#+\s*/gm, '')
    // Remove markdown bold/italic
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Collect all posts from a content type
 */
function collectPosts(type) {
  const baseDir = path.join(rootDir, 'src/content', type);
  const posts = [];

  if (!fs.existsSync(baseDir)) {
    return posts;
  }

  const topicDirs = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const topicDir of topicDirs) {
    const topicSlug = topicDir.name;
    const topic = loadTopicMetadata(type, topicSlug);
    const topicPath = path.join(baseDir, topicSlug);

    const files = fs.readdirSync(topicPath)
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(topicPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      // Skip drafts
      if (frontmatter.draft) continue;

      const postSlug = file.replace(/\.mdx?$/, '');
      const id = `${type}-${topicSlug}-${postSlug}`;

      posts.push({
        id,
        title: frontmatter.title || '',
        description: frontmatter.description || '',
        content: cleanContent(body).slice(0, 10000), // Limit content size
        topic: topicSlug,
        topicTitle: topic?.title || topicSlug,
        type,
        url: `/${type}/${topicSlug}/${postSlug}`,
        date: frontmatter.date ? new Date(frontmatter.date).getTime() : Date.now(),
      });
    }
  }

  return posts;
}

/**
 * Main build function
 */
function main() {
  console.log('Building search index...');

  // Collect all posts
  const blogPosts = collectPosts('blog');
  const docsPosts = collectPosts('docs');
  const allPosts = [...blogPosts, ...docsPosts];

  console.log(`Found ${blogPosts.length} blog posts and ${docsPosts.length} docs`);

  // Ensure public directory exists
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write search index
  const indexPath = path.join(publicDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(allPosts, null, 2));

  console.log(`Search index written to ${indexPath}`);
  console.log(`Total documents indexed: ${allPosts.length}`);
}

main();
