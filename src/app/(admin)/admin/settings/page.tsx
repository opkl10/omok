'use client';

import { useState, useEffect } from 'react';

interface Settings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  postsPerPage: string;
  allowComments: string;
  maintenanceMode: string;
  googleAnalyticsId: string;
  footerText: string;
}

const defaultSettings: Settings = {
  siteName: '',
  siteDescription: '',
  siteUrl: '',
  postsPerPage: '10',
  allowComments: 'true',
  maintenanceMode: 'false',
  googleAnalyticsId: '',
  footerText: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings({ ...defaultSettings, ...data });
    } catch (error) {
      console.error('Fetch settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'ההגדרות נשמרו בהצלחה' });
      } else {
        setMessage({ type: 'error', text: 'שגיאה בשמירת ההגדרות' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בשמירת ההגדרות' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">הגדרות האתר</h1>

      {message.text && (
        <div
          className={`px-4 py-3 rounded mb-6 ${
            message.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">הגדרות כלליות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">שם האתר</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">כתובת האתר</label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleChange('siteUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">תיאור האתר</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">הגדרות תוכן</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">פוסטים לעמוד</label>
              <input
                type="number"
                value={settings.postsPerPage}
                onChange={(e) => handleChange('postsPerPage', e.target.value)}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">אפשר תגובות</label>
              <select
                value={settings.allowComments}
                onChange={(e) => handleChange('allowComments', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">כן</option>
                <option value="false">לא</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">הגדרות מתקדמות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">מזהה Google Analytics</label>
              <input
                type="text"
                value={settings.googleAnalyticsId}
                onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">מצב תחזוקה</label>
              <select
                value={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">כבוי</option>
                <option value="true">פעיל</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">טקסט פוטר</label>
              <textarea
                value={settings.footerText}
                onChange={(e) => handleChange('footerText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'שומר...' : 'שמור הגדרות'}
          </button>
        </div>
      </form>
    </div>
  );
}
