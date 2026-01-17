import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripHtml } from '@/lib/blog-utils';

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const buildDate = new Date().toUTCString();

  const rssItems = posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : buildDate;
      const description = post.excerpt || stripHtml(post.content).substring(0, 200) + '...';

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${post.author.name}</author>
      ${post.category ? `<category>${post.category.name}</category>` : ''}
      <description><![CDATA[${description}]]></description>
      ${post.featuredImage ? `<enclosure url="${post.featuredImage}" type="image/jpeg" />` : ''}
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Omer's Blog</title>
    <link>${baseUrl}</link>
    <description>בלוג של עומר - מחשבות, רעיונות וסיפורים</description>
    <language>he</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
