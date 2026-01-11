'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const menuItems = [
  { href: '/admin', label: 'לוח בקרה', icon: '📊' },
  { href: '/admin/posts', label: 'פוסטים', icon: '📝' },
  { href: '/admin/pages', label: 'עמודים', icon: '📄' },
  { href: '/admin/categories', label: 'קטגוריות', icon: '📁' },
  { href: '/admin/media', label: 'מדיה', icon: '🖼️' },
  { href: '/admin/users', label: 'משתמשים', icon: '👥' },
  { href: '/admin/settings', label: 'הגדרות', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-64 bg-gray-800 min-h-screen text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">ניהול בלוג</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            {session?.user?.name?.[0] || '?'}
          </div>
          <div>
            <div className="font-medium">{session?.user?.name}</div>
            <div className="text-sm text-gray-400">{session?.user?.role}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors"
        >
          התנתק
        </button>
      </div>

      <div className="p-4 border-t border-gray-700">
        <Link
          href="/"
          className="block text-center text-gray-400 hover:text-white text-sm"
        >
          חזרה לאתר ←
        </Link>
      </div>
    </div>
  );
}
