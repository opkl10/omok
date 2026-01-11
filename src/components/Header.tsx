import Link from 'next/link';
import prisma from '@/lib/prisma';

async function getSettings() {
  const settings = await prisma.settings.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((setting) => {
    settingsMap[setting.key] = setting.value;
  });
  return settingsMap;
}

async function getPages() {
  return prisma.page.findMany({
    where: { status: 'published' },
    select: { slug: true, title: true },
    take: 5,
  });
}

export default async function Header() {
  const [settings, pages] = await Promise.all([getSettings(), getPages()]);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            {settings.siteName || 'הבלוג שלי'}
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ראשי
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">
              בלוג
            </Link>
            {pages.map((page) => (
              <Link
                key={page.slug}
                href={`/page/${page.slug}`}
                className="text-gray-600 hover:text-gray-900"
              >
                {page.title}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700"
            >
              כניסה
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
