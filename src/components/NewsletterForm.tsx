'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('שגיאה בהרשמה, נסה שוב');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-2">הצטרפו לניוזלטר שלנו 📧</h3>
        <p className="mb-6 text-blue-100">
          קבלו עדכונים על פוסטים חדשים ותכנים בלעדיים ישירות למייל
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת האימייל שלך"
            required
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 px-4 py-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'loading' ? 'נרשם...' : status === 'success' ? '✓ נרשמת!' : 'הרשם עכשיו'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              status === 'success' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-4 text-xs text-blue-200">
          אנחנו מכבדים את הפרטיות שלך. ניתן להסיר את עצמך בכל עת.
        </p>
      </div>
    </div>
  );
}
