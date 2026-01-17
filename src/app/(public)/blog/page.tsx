import Link from 'next/link';
import prisma from '@/lib/prisma';
import SearchBar from '@/components/SearchBar';
import NewsletterForm from '@/components/NewsletterForm';
import { formatReadingTime } from '@/lib/blog-utils';

async function getPosts(page: number = 1, perPage: number = 10) {
  const skip = (page - 1) * perPage;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: perPage,
      skip,
    }),
    prisma.post.count({ where: { status: 'published' } }),
  ]);

  return { posts, total, pages: Math.ceil(total / perPage) };
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const [{ posts, total, pages }, categories] = await Promise.all([
    getPosts(currentPage),
    getCategories(),
  ]);

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Search */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">הבלוג שלנו 📝</h1>
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Posts List */}
          <div className="lg:col-span-3 space-y-8">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">אין פוסטים עדיין.</p>
                <p className="text-sm text-gray-400 mt-2">הפוסט הראשון יופיע כאן בקרוב...</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      {post.featuredImage && (
                        <Link href={`/blog/${post.slug}`} className="md:w-1/3 flex-shrink-0">
                          <div className="aspect-video md:aspect-square bg-gray-100">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                      )}
                      <div className="p-6 flex-1">
                        {post.category && (
                          <span className="text-sm text-blue-600 font-medium">
                            {post.category.name}
                          </span>
                        )}
                        <h2 className="text-2xl font-bold mt-2 mb-3">
                          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{post.author.name}</span>
                          <div className="flex items-center gap-2">
                            {post.readingTime && (
                              <>
                                <span>{formatReadingTime(post.readingTime)}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString('he-IL')
                                : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Newsletter Subscription */}
                <div className="my-12">
                  <NewsletterForm />
                </div>
              </>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    ← הקודם
                  </Link>
                )}
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                  let pageNum;
                  if (pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pages - 2) {
                    pageNum = pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}`}
                      className={`px-4 py-2 border rounded-md transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                {currentPage < pages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    הבא →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                קטגוריות
              </h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-sm">אין קטגוריות עדיין.</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/blog?category=${category.slug}`}
                        className="text-gray-600 hover:text-blue-600 flex items-center justify-between group"
                      >
                        <span className="group-hover:underline">{category.name}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {category._count.posts}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* RSS Feed */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
                </svg>
                RSS Feed
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                הירשם לעדכונים אוטומטיים דרך RSS
              </p>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <span>הירשם ל-RSS</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
