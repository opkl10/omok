'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MediaSelector from './MediaSelector';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface Page {
  id?: string;
  title: string;
  content: string;
  status: string;
  template: string;
  featuredImage?: string;
  headerColor?: string;
}

export default function PageEditor({ page }: { page?: Page }) {
  const router = useRouter();
  const [title, setTitle] = useState(page?.title || '');
  const [content, setContent] = useState(page?.content || '');
  const [status, setStatus] = useState(page?.status || 'draft');
  const [template, setTemplate] = useState(page?.template || 'default');
  const [featuredImage, setFeaturedImage] = useState(page?.featuredImage || '');
  const [headerColor, setHeaderColor] = useState(page?.headerColor || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<'featured' | 'content'>('featured');
  const quillRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = page?.id ? `/api/pages/${page.id}` : '/api/pages';
      const method = page?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, status, template, featuredImage, headerColor }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save page');
      }

      router.push('/admin/pages');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaSelectorTarget === 'featured') {
      setFeaturedImage(url);
    } else if (mediaSelectorTarget === 'content' && quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        editor.insertEmbed(range.index, 'image', window.location.origin + url);
      }
    }
  };

  const imageHandler = () => {
    setMediaSelectorTarget('content');
    setShowMediaSelector(true);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תוכן</label>
            <div className="bg-white">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="h-96"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-12 lg:pt-0">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">פרסום</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">טיוטה</option>
                  <option value="published">פורסם</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תבנית</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">ברירת מחדל</option>
                  <option value="full-width">רוחב מלא</option>
                  <option value="sidebar">עם סיידבר</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'שומר...' : page?.id ? 'עדכן' : 'פרסם'}
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">תמונה ראשית</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="כתובת URL של התמונה"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setMediaSelectorTarget('featured');
                  setShowMediaSelector(true);
                }}
                className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm"
              >
                בחר מספריית המדיה
              </button>
            </div>
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Featured"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">צבע כותרת</h3>
            <input
              type="color"
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            {headerColor && (
              <div className="mt-2 text-sm text-gray-600">
                צבע נבחר: {headerColor}
              </div>
            )}
          </div>
        </div>
      </div>

      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        onSelect={handleMediaSelect}
        allowVideos={true}
      />
    </form>
  );
}
