import Link from 'next/link';
import prisma from '@/lib/prisma';

async function get404Settings() {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['notFoundTitle', 'notFoundMessage'],
      },
    },
  });

  const settingsMap: Record<string, string> = {
    notFoundTitle: 'עמוד לא נמצא',
    notFoundMessage: 'מצטערים, העמוד שחיפשת לא נמצא.',
  };

  settings.forEach((setting) => {
    settingsMap[setting.key] = setting.value;
  });

  return settingsMap;
}

export default async function NotFound() {
  const settings = await get404Settings();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {settings.notFoundTitle}
        </h2>
        <p className="text-gray-600 mb-8">
          {settings.notFoundMessage}
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
