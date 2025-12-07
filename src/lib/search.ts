/**
 * Custom search implementation with fuzzy matching
 * No external dependencies required
 */

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

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  topic: string;
  type: 'blog' | 'docs';
  url: string;
  score: number;
}

// Search index loaded from generated JSON
let searchIndex: SearchDocument[] = [];

/**
 * Load the search index (call this on server startup or first search)
 */
export async function loadSearchIndex(): Promise<void> {
  if (searchIndex.length > 0) return;

  try {
    // Dynamic import of the search index JSON
    const response = await fetch(new URL('/search-index.json', import.meta.url));
    if (response.ok) {
      searchIndex = await response.json();
    }
  } catch {
    // Fallback: try to import directly (works in Node environment)
    try {
      const fs = await import('fs');
      const path = await import('path');
      const indexPath = path.join(process.cwd(), 'public', 'search-index.json');
      const data = fs.readFileSync(indexPath, 'utf-8');
      searchIndex = JSON.parse(data);
    } catch {
      console.warn('Search index not found, search will be empty');
      searchIndex = [];
    }
  }
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy match score (0-1, higher is better)
 */
function fuzzyScore(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match
  if (textLower.includes(queryLower)) {
    // Boost score based on where the match occurs
    const index = textLower.indexOf(queryLower);
    const positionBoost = 1 - (index / textLower.length) * 0.3;
    return 1 * positionBoost;
  }

  // Word-level matching
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
  const textWords = textLower.split(/\s+/);

  let matchedWords = 0;
  let totalScore = 0;

  for (const queryWord of queryWords) {
    let bestWordScore = 0;

    for (const textWord of textWords) {
      // Exact word match
      if (textWord === queryWord) {
        bestWordScore = Math.max(bestWordScore, 1);
        continue;
      }

      // Starts with query
      if (textWord.startsWith(queryWord)) {
        bestWordScore = Math.max(bestWordScore, 0.9);
        continue;
      }

      // Contains query
      if (textWord.includes(queryWord)) {
        bestWordScore = Math.max(bestWordScore, 0.7);
        continue;
      }

      // Fuzzy match using Levenshtein distance
      if (queryWord.length >= 3 && textWord.length >= 3) {
        const distance = levenshteinDistance(queryWord, textWord);
        const maxLen = Math.max(queryWord.length, textWord.length);
        const similarity = 1 - distance / maxLen;

        // Only consider if similarity is above threshold
        if (similarity > 0.6) {
          bestWordScore = Math.max(bestWordScore, similarity * 0.6);
        }
      }
    }

    if (bestWordScore > 0) {
      matchedWords++;
      totalScore += bestWordScore;
    }
  }

  if (queryWords.length === 0) return 0;

  // Return weighted average, penalizing for unmatched words
  const matchRatio = matchedWords / queryWords.length;
  return (totalScore / queryWords.length) * matchRatio;
}

/**
 * Highlight matching text in excerpt
 */
function highlightExcerpt(text: string, query: string, maxLength = 150): string {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Find the best matching position
  let bestIndex = textLower.indexOf(queryLower);

  if (bestIndex === -1) {
    // Try to find any query word
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    for (const word of queryWords) {
      const idx = textLower.indexOf(word);
      if (idx !== -1) {
        bestIndex = idx;
        break;
      }
    }
  }

  // If still not found, just return start of text
  if (bestIndex === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  // Calculate excerpt window
  const start = Math.max(0, bestIndex - 50);
  const end = Math.min(text.length, bestIndex + maxLength);

  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';

  return excerpt;
}

/**
 * Search the index
 */
export async function search(
  query: string,
  options?: {
    type?: 'blog' | 'docs';
    limit?: number;
  }
): Promise<SearchResult[]> {
  await loadSearchIndex();

  if (!query.trim() || searchIndex.length === 0) {
    return [];
  }

  const limit = options?.limit || 10;
  const results: Array<SearchResult & { _score: number }> = [];

  for (const doc of searchIndex) {
    // Filter by type if specified
    if (options?.type && doc.type !== options.type) {
      continue;
    }

    // Calculate scores for different fields (weighted)
    const titleScore = fuzzyScore(query, doc.title) * 3;
    const descScore = fuzzyScore(query, doc.description) * 2;
    const topicScore = fuzzyScore(query, doc.topicTitle) * 1.5;
    const contentScore = fuzzyScore(query, doc.content) * 1;

    const totalScore = titleScore + descScore + topicScore + contentScore;

    // Only include if there's some match
    if (totalScore > 0.3) {
      results.push({
        id: doc.id,
        title: doc.title,
        excerpt: highlightExcerpt(doc.description || doc.content, query),
        topic: doc.topicTitle,
        type: doc.type,
        url: doc.url,
        score: totalScore,
        _score: totalScore,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b._score - a._score);

  // Return top results
  return results.slice(0, limit).map(({ _score, ...rest }) => rest);
}

/**
 * Set the search index directly (useful for SSR)
 */
export function setSearchIndex(index: SearchDocument[]): void {
  searchIndex = index;
}
