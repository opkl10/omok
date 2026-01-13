'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface Settings {
  siteName?: string;
  footerText?: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<Settings>({});
  const theme = useTheme();
  const year = new Date().getFullYear();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => setSettings({}));
  }, []);

  return (
    <footer
      className="py-8 mt-auto"
      style={{ backgroundColor: theme.footerBgColor }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          {settings.footerText ? (
            <p className="text-gray-300">{settings.footerText}</p>
          ) : (
            <p className="text-gray-300">
              {settings.siteName || 'הבלוג שלי'} &copy; {year}. כל הזכויות שמורות.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
