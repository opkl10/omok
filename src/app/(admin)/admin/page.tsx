import prisma from '@/lib/prisma';
import Link from 'next/link';

async function getStats() {
  const [postsCount, pagesCount, mediaCount, usersCount] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.media.count(),
    prisma.user.count(),
  ]);

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });

  return { postsCount, pagesCount, mediaCount, usersCount, recentPosts };
}

export default async function AdminDashboard() {
  const { postsCount, pagesCount, mediaCount, usersCount, recentPosts } = await getStats();

  const stats = [
    { label: 'פוסטים', value: postsCount, href: '/admin/posts', color: 'bg-blue-500' },
    { label: 'עמודים', value: pagesCount, href: '/admin/pages', color: 'bg-green-500' },
    { label: 'קבצי מדיה', value: mediaCount, href: '/admin/media', color: 'bg-purple-500' },
    { label: 'משתמשים', value: usersCount, href: '#', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">לוח בקרה</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
              {stat.value}
            </div>
            <div className="text-black">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">פוסטים אחרונים</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentPosts.length === 0 ? (
            <div className="px-6 py-8 text-center text-black">
              אין פוסטים עדיין.{' '}
              <Link href="/admin/posts/new" className="text-blue-600 hover:underline">
                צור פוסט חדש
              </Link>
            </div>
          ) : (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="block px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-sm text-black">
                      {post.author.name} • {new Date(post.createdAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {post.status === 'published' ? 'פורסם' : 'טיוטה'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
