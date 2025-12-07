import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: import.meta.env.MEILISEARCH_HOST || process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: import.meta.env.MEILISEARCH_API_KEY || process.env.MEILISEARCH_API_KEY || 'masterKey',
});

const INDEX_NAME = 'posts';

export interface SearchDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  topic: string;
  topicTitle: string;
  type: 'blog' | 'docs';
  url: string;
  date: number;
}

export async function initSearchIndex() {
  try {
    const index = client.index(INDEX_NAME);

    // Configure index settings
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

    console.log('Search index configured');
  } catch (error) {
    console.error('Failed to configure search index:', error);
  }
}

export async function indexDocuments(documents: SearchDocument[]) {
  try {
    const index = client.index(INDEX_NAME);
    const result = await index.addDocuments(documents);
    console.log(`Indexed ${documents.length} documents, task: ${result.taskUid}`);
    return result;
  } catch (error) {
    console.error('Failed to index documents:', error);
    throw error;
  }
}

export async function search(query: string, options?: {
  type?: 'blog' | 'docs';
  limit?: number;
}) {
  try {
    const index = client.index(INDEX_NAME);

    const filters: string[] = [];
    if (options?.type) {
      filters.push(`type = "${options.type}"`);
    }

    const results = await index.search(query, {
      limit: options?.limit || 10,
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
      attributesToHighlight: ['title', 'description', 'content'],
      attributesToCrop: ['content'],
      cropLength: 100,
    });

    return results.hits.map(hit => ({
      id: hit.id,
      title: hit._formatted?.title || hit.title,
      excerpt: hit._formatted?.description || hit.description,
      content: hit._formatted?.content || hit.content,
      topic: hit.topicTitle,
      type: hit.type,
      url: hit.url,
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function clearIndex() {
  try {
    const index = client.index(INDEX_NAME);
    await index.deleteAllDocuments();
    console.log('Search index cleared');
  } catch (error) {
    console.error('Failed to clear index:', error);
  }
}
