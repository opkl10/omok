'use client';

import React, { useEffect, useState } from 'react';

export default function SiteSettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  const save = async () => {
    const payload = Object.keys(editing).map((k) => ({ key: k, value: editing[k] }));
    const res = await fetch('/api/settings', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const updated = await res.json();
      // Merge into settings
      const newSettings = { ...settings };
      updated.forEach((item: any) => (newSettings[item.key] = item.value));
      setSettings(newSettings);
      setEditing({});
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">הגדרות אתר</h1>
      <div className="space-y-4">
        {['siteName','siteDescription','footerText','primaryColor','secondaryColor','backgroundColor','textColor','404Title','404Message'].map((key) => (
          <div key={key} className="flex gap-4 items-center">
            <div className="w-48 font-medium">{key}</div>
            <input className="border px-3 py-2 flex-1" value={editing[key] ?? settings[key] ?? ''} onChange={(e) => setEditing((s) => ({ ...s, [key]: e.target.value }))} />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">שמור</button>
      </div>
    </div>
  );
}
