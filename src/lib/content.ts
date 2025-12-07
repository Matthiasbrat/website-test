import { getCollection, type CollectionEntry } from 'astro:content';
import type { Topic } from '../content/config';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type BlogPost = CollectionEntry<'blog'>;
export type DocsPost = CollectionEntry<'docs'>;
export type Post = BlogPost | DocsPost;

// Load topic metadata from _topic.yaml files
export async function loadTopicMetadata(
  type: 'blog' | 'docs',
  topicSlug: string
): Promise<Topic | null> {
  try {
    const topicPath = path.join(
      process.cwd(),
      'src/content',
      type,
      topicSlug,
      '_topic.yaml'
    );
    const content = fs.readFileSync(topicPath, 'utf-8');
    return yaml.load(content) as Topic;
  } catch {
    return null;
  }
}

// Get all topics for a content type
export async function getTopics(type: 'blog' | 'docs'): Promise<Topic[]> {
  const basePath = path.join(process.cwd(), 'src/content', type);
  const topics: Topic[] = [];

  try {
    const dirs = fs.readdirSync(basePath, { withFileTypes: true });

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const topic = await loadTopicMetadata(type, dir.name);
        if (topic) {
          topics.push(topic);
        }
      }
    }
  } catch {
    // Content directory might not exist yet
  }

  return topics;
}

// Get all topics from both blog and docs
export async function getAllTopics(): Promise<{ type: 'blog' | 'docs'; topic: Topic }[]> {
  const blogTopics = await getTopics('blog');
  const docsTopics = await getTopics('docs');

  return [
    ...blogTopics.map(topic => ({ type: 'blog' as const, topic })),
    ...docsTopics.map(topic => ({ type: 'docs' as const, topic })),
  ];
}

// Get posts for a specific topic
export async function getPostsByTopic(
  type: 'blog' | 'docs',
  topicSlug: string
): Promise<Post[]> {
  const collection = await getCollection(type);

  return collection
    .filter(post => {
      const pathParts = post.id.split('/');
      return pathParts[0] === topicSlug && !post.data.draft;
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// Get all published blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// Get all published docs
export async function getAllDocs(): Promise<DocsPost[]> {
  const posts = await getCollection('docs');
  return posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// Get a single post by slug
export async function getPostBySlug(
  type: 'blog' | 'docs',
  slug: string
): Promise<Post | undefined> {
  const collection = await getCollection(type);
  return collection.find(post => post.slug === slug);
}

// Get topic slug from post ID
export function getTopicSlugFromPost(post: Post): string {
  return post.id.split('/')[0];
}

// Get post slug from post ID
export function getPostSlugFromId(postId: string): string {
  const parts = postId.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.mdx?$/, '');
}

// Get adjacent posts in the same topic
export async function getAdjacentPosts(
  type: 'blog' | 'docs',
  currentPost: Post
): Promise<{ prev: Post | null; next: Post | null }> {
  const topicSlug = getTopicSlugFromPost(currentPost);
  const posts = await getPostsByTopic(type, topicSlug);

  const currentIndex = posts.findIndex(p => p.id === currentPost.id);

  return {
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}

// Get post count for a topic
export async function getTopicPostCount(
  type: 'blog' | 'docs',
  topicSlug: string
): Promise<number> {
  const posts = await getPostsByTopic(type, topicSlug);
  return posts.length;
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format relative date
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(date);
}
