import Link from 'next/link';
import prisma from '@/lib/prisma';

async function getRecentPosts() {
  return prisma.post.findMany({
    where: { status: 'published' },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  });
}

async function getSettings() {
  const settings = await prisma.settings.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((setting) => {
    settingsMap[setting.key] = setting.value;
  });
  return settingsMap;
}

export default async function HomePage() {
  const [posts, settings] = await Promise.all([getRecentPosts(), getSettings()]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {settings.siteName || 'ברוכים הבאים לבלוג'}
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            {settings.siteDescription || 'התוכן הטוב ביותר במקום אחד'}
          </p>
          <Link
            href="/blog"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-blue-50 transition-colors"
          >
            לכל הפוסטים
          </Link>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">פוסטים אחרונים</h2>

          {posts.length === 0 ? (
            <p className="text-center text-gray-500">עדיין אין פוסטים. חזרו בקרוב!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.featuredImage && (
                    <Link href={`/blog/${post.slug}`}>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-sm text-blue-600 font-medium">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold mt-2 mb-3">
                      <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
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

          {posts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-blue-600 hover:text-white transition-colors"
              >
                הצג עוד פוסטים
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
