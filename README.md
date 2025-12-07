# Matthias Documentation Site

A personal blog and documentation site built with Astro, featuring 40+ developer themes, MDX content, full-text search, and a comments system.

## Features

- **40+ Developer Themes**: One Dark, Dracula, Nord, GitHub, Catppuccin, and many more
- **MDX Content**: Blog posts and documentation with custom components
- **Full-Text Search**: Powered by Meilisearch with fuzzy matching
- **Comments & Reactions**: Authenticated comments and anonymous emoji reactions
- **Responsive Design**: Mobile-first with glassmorphism UI elements
- **Client-Side Routing**: Smooth navigation without full page reloads
- **SEO Optimized**: Meta tags, Open Graph, Twitter cards, RSS feed, sitemap

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

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

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. Start Docker services:
   ```bash
   docker-compose up -d
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:4321

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
│   ├── auth.ts         # Better Auth configuration
│   ├── content.ts      # Content loading utilities
│   ├── db.ts           # Database operations
│   ├── search.ts       # Search functionality
│   └── themes.ts       # Theme definitions
├── pages/              # Route definitions
│   ├── api/            # API endpoints
│   └── ...
└── styles/             # Global styles and themes
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

Search is powered by Meilisearch. To rebuild the search index:

```bash
npm run index
```

This is automatically run during the build process.

## Authentication

The site uses Better Auth for authentication:

- Google OAuth for commenting
- Anonymous sessions for emoji reactions

Configure OAuth credentials in your `.env` file.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `MEILISEARCH_HOST` | Meilisearch server URL |
| `MEILISEARCH_API_KEY` | Meilisearch API key |
| `BETTER_AUTH_SECRET` | Secret for session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `PUBLIC_SITE_URL` | Public URL of the site |

## Deployment

1. Build the site:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run preview
   ```

For production, ensure Docker services are running and environment variables are configured.

## License

MIT
