import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteButton from '../posts/DeleteButton';

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    include: {
      author: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">עמודים</h1>
        <Link
          href="/admin/pages/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          עמוד חדש +
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">כותרת</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">מחבר</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">תבנית</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">סטטוס</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">תאריך</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-black">
                  אין עמודים עדיין
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/pages/${page.id}`} className="text-blue-600 hover:underline">
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-black">{page.author.name}</td>
                  <td className="px-6 py-4 text-black">{page.template}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {page.status === 'published' ? 'פורסם' : 'טיוטה'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-black">
                    {new Date(page.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        ערוך
                      </Link>
                      <DeleteButton id={page.id} type="pages" />
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
