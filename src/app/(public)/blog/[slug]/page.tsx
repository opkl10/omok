import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

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
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.categoryId, post.id);

  return (
    <article className="py-12 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <span className="text-blue-600 font-medium">{post.category.name}</span>
          )}
          <h1 className="text-4xl font-bold mt-2 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-500">
            <span>מאת {post.author.name}</span>
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
          </div>
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
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share & Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← חזרה לכל הפוסטים
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
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-medium">{relatedPost.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'פוסט לא נמצא' };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}
