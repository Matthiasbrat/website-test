# Matthias Documentation Site

A personal blog and documentation site built with Astro, featuring 40+ developer themes, MDX content, full-text search, and a comments system.

## Features

- **40+ Developer Themes**: One Dark, Dracula, Nord, GitHub, Catppuccin, and many more
- **MDX Content**: Blog posts and documentation with custom components
- **Full-Text Search**: Custom fuzzy search with Levenshtein distance matching
- **Comments & Reactions**: Simple name-based comments and emoji reactions
- **Responsive Design**: Mobile-first with glassmorphism UI elements
- **Client-Side Routing**: Smooth navigation without full page reloads
- **SEO Optimized**: Meta tags, Open Graph, Twitter cards, RSS feed, sitemap
- **Zero External Dependencies**: No database or external services required (POC)

## Quick Start

### Prerequisites

- Node.js 18+

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd matthias-docs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:4321

## Project Structure

```
src/
├── components/          # UI components
│   ├── mdx/            # MDX-specific components
│   └── ...
├── content/            # Content collections
│   ├── blog/           # Blog posts by topic
│   ├── docs/           # Documentation by topic
│   └── referrals/      # Referral profiles
├── layouts/            # Page layouts
├── lib/                # Utility functions
│   ├── content.ts      # Content loading utilities
│   ├── db.ts           # JSON file storage (POC)
│   ├── search.ts       # Custom search with fuzzy matching
│   └── themes.ts       # Theme definitions
├── pages/              # Route definitions
│   ├── api/            # API endpoints
│   └── ...
└── styles/             # Global styles and themes

data/                   # JSON storage for comments/reactions (created at runtime)
```

## Content Management

### Creating a Blog Post

1. Create or use an existing topic folder in `src/content/blog/`
2. Add a `_topic.yaml` file for the topic:
   ```yaml
   slug: my-topic
   title: My Topic
   description: Topic description
   banner: /images/topics/my-topic.jpg
   ```
3. Create an MDX file:
   ```mdx
   ---
   title: "My Post Title"
   description: "Post description"
   date: 2024-01-15
   ---

   # My Post

   Content goes here...
   ```

### Available MDX Components

- `<Callout>` - Note, tip, warning, danger callouts
- `<Aside>` - Margin notes (sidebar on desktop)
- `<YouTube>` - Embedded YouTube videos
- `<Spotify>` - Embedded Spotify players
- `<MediaPlayer>` - Audio/video player
- `<PDFViewer>` - Inline PDF viewer
- `<Image>` - Enhanced images with lightbox

## Themes

The site includes 40+ developer themes. Users can switch themes via the theme switcher in the header. The selection is persisted in localStorage.

Light themes: One Light, GitHub Light, Solarized Light, Catppuccin Latte, etc.
Dark themes: One Dark, Dracula, Nord, Tokyo Night, Catppuccin Mocha, etc.

## Search

Search uses a custom implementation with:
- **Fuzzy matching** using Levenshtein distance for typo tolerance
- **Weighted scoring** (title > description > topic > content)
- **Word-level matching** with prefix and substring support

The search index is automatically built during `npm run build` and stored as a JSON file. No external services required.

## Comments & Reactions

This POC uses simple JSON file storage for comments and reactions:

- **Comments**: Users enter their name and comment (stored in `data/comments.json`)
- **Reactions**: Emoji reactions tracked by visitor ID (stored in `data/reactions.json`)

The visitor ID and author name are saved in localStorage for convenience.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PUBLIC_SITE_URL` | Public URL of the site (default: http://localhost:4321) |

## Deployment

1. Build the site:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run preview
   ```

The site uses JSON file storage for comments and reactions, stored in the `data/` directory. Ensure this directory is writable in production.

## License

MIT
