import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SocialShare from '@/components/SocialShare';
import { formatReadingTime, formatViewCount } from '@/lib/blog-utils';
import type { Metadata } from 'next';

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug, status: 'published' },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });
}

async function getRelatedPosts(categoryId: string | null, currentPostId: string) {
  if (!categoryId) return [];

  return prisma.post.findMany({
    where: {
      categoryId,
      id: { not: currentPostId },
      status: 'published',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      readingTime: true,
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });
}

async function incrementViews(postId: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error('Failed to increment views:', error);
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Increment views (async, non-blocking)
  incrementViews(post.id);

  const relatedPosts = await getRelatedPosts(post.categoryId, post.id);

  // Generate full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <article className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="text-blue-600 font-medium hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="text-4xl font-bold mt-2 mb-4">{post.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm">
            <span className="font-medium">מאת {post.author.name}</span>
            <span>•</span>
            <time>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </time>
            {post.readingTime && (
              <>
                <span>•</span>
                <span>{formatReadingTime(post.readingTime)}</span>
              </>
            )}
            <span>•</span>
            <span>{formatViewCount(post.views)}</span>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-4 text-lg text-gray-600 italic">{post.excerpt}</p>
          )}
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Social Share */}
        <div className="my-12 p-6 bg-gray-50 rounded-lg">
          <SocialShare
            url={postUrl}
            title={post.title}
            description={post.metaDescription || post.excerpt || undefined}
          />
        </div>

        {/* Back to Blog */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link href="/blog" className="text-blue-600 hover:underline inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>חזרה לכל הפוסטים</span>
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">פוסטים קשורים</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {relatedPost.featuredImage && (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                    {relatedPost.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{relatedPost.excerpt}</p>
                    )}
                    {relatedPost.readingTime && (
                      <span className="text-xs text-gray-500">{formatReadingTime(relatedPost.readingTime)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section - Placeholder for future Giscus integration */}
        {post.allowComments && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4">תגובות</h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              <p>מערכת התגובות תהיה זמינה בקרוב</p>
              <p className="text-sm mt-2">בינתיים, נשמח לשמוע ממך ברשתות החברתיות</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'פוסט לא נמצא' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const imageUrl = post.ogImage || post.featuredImage || `${baseUrl}/default-og.png`;

  return {
    title: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    keywords: post.metaKeywords || undefined,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt || undefined,
      url: postUrl,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: [imageUrl],
    },
  };
}
