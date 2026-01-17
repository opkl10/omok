import prisma from '@/lib/prisma';
import { formatViewCount } from '@/lib/blog-utils';
import Link from 'next/link';

async function getAnalytics() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    topPosts,
    recentPosts,
    newsletterCount,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.post.count({ where: { status: 'draft' } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { views: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
      },
    }),
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
      },
    }),
    prisma.newsletter.count({ where: { active: true } }),
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: totalViews._sum.views || 0,
    topPosts,
    recentPosts,
    newsletterCount,
  };
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">סטטיסטיקות ואנליטיקס 📊</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Posts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">סה"כ פוסטים</p>
              <p className="text-3xl font-bold mt-1">{analytics.totalPosts}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-green-600">✓ {analytics.publishedPosts} פורסמו</span>
            <span className="text-yellow-600">⊙ {analytics.draftPosts} טיוטות</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">סה"כ צפיות</p>
              <p className="text-3xl font-bold mt-1">{formatViewCount(analytics.totalViews)}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            ממוצע: {analytics.publishedPosts > 0 ? Math.round(analytics.totalViews / analytics.publishedPosts) : 0} צפיות לפוסט
          </p>
        </div>

        {/* Newsletter Subscribers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">מנויי ניוזלטר</p>
              <p className="text-3xl font-bold mt-1">{analytics.newsletterCount}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {analytics.newsletterCount > 0 ? 'מנויים פעילים' : 'אין מנויים עדיין'}
          </p>
        </div>

        {/* Average Reading Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">פוסטים השבוע</p>
              <p className="text-3xl font-bold mt-1">
                {analytics.recentPosts.filter(p => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return p.publishedAt && new Date(p.publishedAt) > weekAgo;
                }).length}
              </p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            מהחודש האחרון
          </p>
        </div>
      </div>

      {/* Top Posts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts by Views */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold">הפוסטים הפופולריים ביותר 🔥</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-sm font-medium hover:text-blue-600 truncate block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {formatViewCount(post.views)}
                    </p>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold">פוסטים אחרונים 📝</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.recentPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-sm font-medium hover:text-blue-600 truncate block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'לא פורסם'}
                      {' · '}
                      {formatViewCount(post.views)}
                    </p>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
