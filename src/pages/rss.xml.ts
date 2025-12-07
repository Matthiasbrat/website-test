import type { APIRoute } from 'astro';
import { getAllBlogPosts, formatDate, getTopicSlugFromPost } from '../lib/content';
import { siteConfig } from '../../site.config';

export const GET: APIRoute = async () => {
  const posts = await getAllBlogPosts();

  const items = posts.map(post => {
    const topicSlug = getTopicSlugFromPost(post);
    const postSlug = post.slug.split('/').pop();
    const url = `${siteConfig.baseUrl}/blog/${topicSlug}/${postSlug}`;

    return `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <description><![CDATA[${post.data.description}]]></description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.title}</title>
    <description>${siteConfig.description}</description>
    <link>${siteConfig.baseUrl}</link>
    <atom:link href="${siteConfig.baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
};
