/**
 * Simple JSON file-based storage for POC
 * In production, this would be replaced with a real database
 */

import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const REACTIONS_FILE = path.join(DATA_DIR, 'reactions.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read JSON file safely
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

// Write JSON file safely
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Generate simple ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Comment types
export interface Comment {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Reaction types
export interface Reaction {
  id: string;
  postSlug: string;
  emoji: string;
  visitorId: string;
}

// Get all comments for a post
export function getComments(postSlug: string): Comment[] {
  const allComments = readJsonFile<Comment[]>(COMMENTS_FILE, []);
  return allComments
    .filter(c => c.postSlug === postSlug)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// Create a new comment
export function createComment(
  postSlug: string,
  authorName: string,
  content: string,
  parentId?: string
): Comment {
  const allComments = readJsonFile<Comment[]>(COMMENTS_FILE, []);

  const comment: Comment = {
    id: generateId(),
    postSlug,
    parentId: parentId || null,
    authorName,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allComments.push(comment);
  writeJsonFile(COMMENTS_FILE, allComments);

  return comment;
}

// Update a comment
export function updateComment(id: string, content: string): Comment | null {
  const allComments = readJsonFile<Comment[]>(COMMENTS_FILE, []);
  const index = allComments.findIndex(c => c.id === id);

  if (index === -1) return null;

  allComments[index].content = content;
  allComments[index].updatedAt = new Date().toISOString();

  writeJsonFile(COMMENTS_FILE, allComments);
  return allComments[index];
}

// Delete a comment
export function deleteComment(id: string): boolean {
  const allComments = readJsonFile<Comment[]>(COMMENTS_FILE, []);
  const index = allComments.findIndex(c => c.id === id);

  if (index === -1) return false;

  allComments.splice(index, 1);
  writeJsonFile(COMMENTS_FILE, allComments);
  return true;
}

// Get reactions for a post
export function getReactions(postSlug: string, visitorId?: string): {
  counts: Record<string, number>;
  userReactions: string[];
} {
  const allReactions = readJsonFile<Reaction[]>(REACTIONS_FILE, []);
  const postReactions = allReactions.filter(r => r.postSlug === postSlug);

  // Count reactions by emoji
  const counts: Record<string, number> = {};
  postReactions.forEach(r => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  });

  // Get user's reactions
  const userReactions = visitorId
    ? postReactions.filter(r => r.visitorId === visitorId).map(r => r.emoji)
    : [];

  return { counts, userReactions };
}

// Toggle a reaction
export function toggleReaction(
  postSlug: string,
  emoji: string,
  visitorId: string
): { counts: Record<string, number>; userReactions: string[] } {
  const allReactions = readJsonFile<Reaction[]>(REACTIONS_FILE, []);

  // Check if reaction already exists
  const existingIndex = allReactions.findIndex(
    r => r.postSlug === postSlug && r.emoji === emoji && r.visitorId === visitorId
  );

  if (existingIndex !== -1) {
    // Remove existing reaction
    allReactions.splice(existingIndex, 1);
  } else {
    // Add new reaction
    allReactions.push({
      id: generateId(),
      postSlug,
      emoji,
      visitorId,
    });
  }

  writeJsonFile(REACTIONS_FILE, allReactions);
  return getReactions(postSlug, visitorId);
}
