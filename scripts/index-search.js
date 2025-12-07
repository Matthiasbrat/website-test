import { MeiliSearch } from 'meilisearch';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
});

const INDEX_NAME = 'posts';

async function loadTopicMetadata(type, topicSlug) {
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

async function collectPosts(type) {
  const baseDir = path.join(rootDir, 'src/content', type);
  const posts = [];

  if (!fs.existsSync(baseDir)) {
    return posts;
  }

  const topicDirs = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const topicDir of topicDirs) {
    const topicSlug = topicDir.name;
    const topic = await loadTopicMetadata(type, topicSlug);
    const topicPath = path.join(baseDir, topicSlug);

    const files = fs.readdirSync(topicPath)
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(topicPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      if (frontmatter.draft) continue;

      const postSlug = file.replace(/\.mdx?$/, '');
      const id = `${type}-${topicSlug}-${postSlug}`;

      posts.push({
        id,
        title: frontmatter.title || '',
        description: frontmatter.description || '',
        content: body.replace(/<[^>]*>/g, '').slice(0, 5000), // Strip HTML, limit content
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

async function main() {
  console.log('Starting search indexing...');

  // Collect all posts
  const blogPosts = await collectPosts('blog');
  const docsPosts = await collectPosts('docs');
  const allPosts = [...blogPosts, ...docsPosts];

  console.log(`Found ${blogPosts.length} blog posts and ${docsPosts.length} docs`);

  if (allPosts.length === 0) {
    console.log('No posts to index');
    return;
  }

  try {
    // Get or create index
    const index = client.index(INDEX_NAME);

    // Configure settings
    await index.updateSettings({
      searchableAttributes: ['title', 'description', 'content', 'topicTitle'],
      filterableAttributes: ['type', 'topic'],
      sortableAttributes: ['date'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
    });

    console.log('Index settings updated');

    // Clear existing documents
    await index.deleteAllDocuments();
    console.log('Cleared existing documents');

    // Add new documents
    const result = await index.addDocuments(allPosts);
    console.log(`Indexing task queued: ${result.taskUid}`);

    // Wait for indexing to complete
    await client.waitForTask(result.taskUid);
    console.log('Indexing complete!');

  } catch (error) {
    console.error('Indexing failed:', error);
    process.exit(1);
  }
}

main();
