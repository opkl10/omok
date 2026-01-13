'use client';

import { useState, useEffect } from 'react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headerBgColor: string;
  footerBgColor: string;
  linkColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  headerBgColor: '#1f2937',
  footerBgColor: '#1f2937',
  linkColor: '#3b82f6',
  buttonBgColor: '#3b82f6',
  buttonTextColor: '#ffffff',
};

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await fetch('/api/settings?key=theme');
      if (response.ok) {
        const data = await response.json();
        if (data.value) {
          setTheme(JSON.parse(data.value));
        }
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'theme',
          value: JSON.stringify(theme),
        }),
      });

      if (response.ok) {
        setMessage('העיצוב נשמר בהצלחה!');
      } else {
        setMessage('שגיאה בשמירת העיצוב');
      }
    } catch (error) {
      setMessage('שגיאה בשמירת העיצוב');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof ThemeSettings, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = () => {
    setTheme(defaultTheme);
  };

  if (loading) {
    return <div className="p-6">טוען...</div>;
  }

  const colorFields: { key: keyof ThemeSettings; label: string }[] = [
    { key: 'primaryColor', label: 'צבע ראשי' },
    { key: 'secondaryColor', label: 'צבע משני' },
    { key: 'backgroundColor', label: 'צבע רקע' },
    { key: 'textColor', label: 'צבע טקסט' },
    { key: 'headerBgColor', label: 'צבע רקע כותרת' },
    { key: 'footerBgColor', label: 'צבע רקע פוטר' },
    { key: 'linkColor', label: 'צבע קישורים' },
    { key: 'buttonBgColor', label: 'צבע רקע כפתורים' },
    { key: 'buttonTextColor', label: 'צבע טקסט כפתורים' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">עיצוב האתר</h1>
        <div className="flex gap-2">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            איפוס לברירת מחדל
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('שגיאה') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colorFields.map(({ key, label }) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium text-black mb-2">{label}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-black mb-4">תצוגה מקדימה</h2>
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <div
            className="p-4 rounded-t-lg mb-4"
            style={{ backgroundColor: theme.headerBgColor }}
          >
            <span style={{ color: theme.buttonTextColor }}>כותרת האתר</span>
          </div>

          <div style={{ color: theme.textColor }}>
            <h3 style={{ color: theme.primaryColor }} className="text-xl font-bold mb-2">
              כותרת לדוגמה
            </h3>
            <p className="mb-4">זהו טקסט לדוגמה שמציג את צבעי האתר. ניתן לראות כאן את הצבעים השונים.</p>
            <a href="#" style={{ color: theme.linkColor }} className="underline">
              קישור לדוגמה
            </a>
            <div className="mt-4">
              <button
                style={{
                  backgroundColor: theme.buttonBgColor,
                  color: theme.buttonTextColor,
                }}
                className="px-4 py-2 rounded"
              >
                כפתור לדוגמה
              </button>
            </div>
          </div>

          <div
            className="p-4 rounded-b-lg mt-4"
            style={{ backgroundColor: theme.footerBgColor }}
          >
            <span style={{ color: theme.buttonTextColor }}>פוטר האתר</span>
          </div>
        </div>
      </div>
    </div>
  );
}
