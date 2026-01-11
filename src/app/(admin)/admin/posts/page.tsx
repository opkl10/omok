import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">פוסטים</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          פוסט חדש +
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">כותרת</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">מחבר</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">קטגוריה</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">סטטוס</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">תאריך</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  אין פוסטים עדיין
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/posts/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{post.author.name}</td>
                  <td className="px-6 py-4 text-gray-500">{post.category?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.status === 'published' ? 'פורסם' : 'טיוטה'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {post.status === 'published' && (
                        <Link
                          href={`/post/${post.uniqueIdentifier}`}
                          className="text-green-600 hover:underline text-sm"
                          target="_blank"
                        >
                          צפה
                        </Link>
                      )}
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        ערוך
                      </Link>
                      <DeleteButton id={post.id} type="posts" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
