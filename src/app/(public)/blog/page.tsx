import Link from 'next/link';
import prisma from '@/lib/prisma';

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
        <h1 className="text-3xl font-bold mb-8">כל הפוסטים</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Posts List */}
          <div className="lg:col-span-3">
            {posts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">אין פוסטים עדיין.</p>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
                  >
                    {post.featuredImage && (
                      <Link href={`/blog/${post.slug}`} className="md:w-1/3 flex-shrink-0">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
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
                        <span>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('he-IL')
                            : ''}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}`}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    הקודם
                  </Link>
                )}
                {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`/blog?page=${page}`}
                    className={`px-4 py-2 border rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </Link>
                ))}
                {currentPage < pages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    הבא
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4">קטגוריות</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-sm">אין קטגוריות עדיין.</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <span className="text-gray-600 hover:text-blue-600">
                        {category.name}
                        <span className="text-gray-400 mr-2">({category._count.posts})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
