import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

async function getPostByUniqueId(uniqueIdentifier: string) {
  return prisma.post.findUnique({
    where: { uniqueIdentifier, status: 'published' },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });
}

export default async function UniquePostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostByUniqueId(id);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen">
      {/* Theme Header */}
      {post.theme && (
        <div className="w-full h-64 relative overflow-hidden">
          {post.themeType === 'image' ? (
            <img
              src={post.theme}
              alt="Post theme"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: post.theme }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
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

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← חזרה לכל הפוסטים
          </Link>
        </div>
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostByUniqueId(id);

  if (!post) {
    return { title: 'פוסט לא נמצא' };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}
