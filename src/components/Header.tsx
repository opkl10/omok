'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface PageLink {
  slug: string;
  title: string;
}

interface Settings {
  siteName?: string;
}

export default function Header() {
  const { data: session, status } = useSession();
  const [pages, setPages] = useState<PageLink[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch('/api/pages?status=published')
      .then(res => res.json())
      .then(data => setPages(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => setPages([]));

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => setSettings({}));
  }, []);

  const isAdmin = session?.user?.role === 'admin';

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-black">
            {settings.siteName || 'הבלוג שלי'}
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-black hover:text-blue-600">
              ראשי
            </Link>
            <Link href="/blog" className="text-black hover:text-blue-600">
              בלוג
            </Link>
            {pages.map((page) => (
              <Link
                key={page.slug}
                href={`/page/${page.slug}`}
                className="text-black hover:text-blue-600"
              >
                {page.title}
              </Link>
            ))}

            {status === 'loading' ? (
              <span className="text-black">...</span>
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className="text-black">שלום, {session.user?.name}</span>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    פאנל ניהול
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-700"
                >
                  התנתק
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700"
              >
                כניסה
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
