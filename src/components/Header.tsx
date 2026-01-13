'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface PageLink {
  slug: string;
  title: string;
}

interface Settings {
  siteName?: string;
  logoType?: string;
  logoText?: string;
  logoImage?: string;
}

export default function Header() {
  const { data: session, status } = useSession();
  const [pages, setPages] = useState<PageLink[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const theme = useTheme();

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

  // Determine if header background is dark or light
  const isDarkHeader = theme.headerBgColor &&
    (theme.headerBgColor.toLowerCase() === '#1f2937' ||
     theme.headerBgColor.toLowerCase() === '#000000' ||
     theme.headerBgColor.toLowerCase().startsWith('#1') ||
     theme.headerBgColor.toLowerCase().startsWith('#2') ||
     theme.headerBgColor.toLowerCase().startsWith('#3'));

  const textColorClass = isDarkHeader ? 'text-white' : 'text-black';

  return (
    <header
      className="shadow-sm"
      style={{ backgroundColor: theme.headerBgColor }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {(settings.logoType === 'image' || settings.logoType === 'both') && settings.logoImage && (
              <img
                src={settings.logoImage}
                alt={settings.siteName || 'Logo'}
                className="h-10 w-auto object-contain"
              />
            )}
            {(settings.logoType === 'text' || settings.logoType === 'both' || !settings.logoType) && (
              <span className={`text-xl font-bold ${textColorClass}`}>
                {settings.logoText || settings.siteName || 'הבלוג שלי'}
              </span>
            )}
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`${textColorClass} hover:opacity-70`}
              style={{ color: isDarkHeader ? 'white' : theme.textColor }}
            >
              ראשי
            </Link>
            <Link
              href="/blog"
              className={`${textColorClass} hover:opacity-70`}
              style={{ color: isDarkHeader ? 'white' : theme.textColor }}
            >
              בלוג
            </Link>
            <Link
              href="/contact"
              className={`${textColorClass} hover:opacity-70`}
              style={{ color: isDarkHeader ? 'white' : theme.textColor }}
            >
              צור קשר
            </Link>
            {pages.map((page) => (
              <Link
                key={page.slug}
                href={`/page/${page.slug}`}
                className={`${textColorClass} hover:opacity-70`}
                style={{ color: isDarkHeader ? 'white' : theme.textColor }}
              >
                {page.title}
              </Link>
            ))}

            {status === 'loading' ? (
              <span className={textColorClass}>...</span>
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className={textColorClass}>שלום, {session.user?.name}</span>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="font-medium hover:opacity-70"
                    style={{ color: theme.linkColor }}
                  >
                    פאנל ניהול
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-red-500 hover:text-red-400"
                >
                  התנתק
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hover:opacity-70"
                style={{ color: theme.linkColor }}
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
