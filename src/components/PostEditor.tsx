'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface Category {
  id: string;
  name: string;
}

interface Post {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  status: string;
  categoryId: string;
  theme: string;
  themeType: string;
}

export default function PostEditor({ post, categories }: { post?: Post; categories: Category[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '');
  const [status, setStatus] = useState(post?.status || 'draft');
  const [categoryId, setCategoryId] = useState(post?.categoryId || '');
  const [theme, setTheme] = useState(post?.theme || '');
  const [themeType, setThemeType] = useState(post?.themeType || 'color');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = post?.id ? `/api/posts/${post.id}` : '/api/posts';
      const method = post?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          featuredImage,
          status,
          categoryId: categoryId || null,
          theme: theme || null,
          themeType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save post');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

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
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="h-96"
              />
            </div>
          </div>

          <div className="pt-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">תקציר</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'שומר...' : post?.id ? 'עדכן' : 'פרסם'}
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">קטגוריה</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ללא קטגוריה</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">תמונה ראשית</h3>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="כתובת URL של התמונה"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Featured"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">ערכת נושא</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג ערכה</label>
                <select
                  value={themeType}
                  onChange={(e) => setThemeType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="color">צבע</option>
                  <option value="image">תמונה</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {themeType === 'color' ? 'צבע נושא' : 'URL תמונת נושא'}
                </label>
                <input
                  type={themeType === 'color' ? 'color' : 'text'}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder={themeType === 'color' ? '#000000' : 'כתובת URL של תמונת הנושא'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {theme && themeType === 'image' && (
                  <img
                    src={theme}
                    alt="Theme"
                    className="mt-2 w-full h-20 object-cover rounded"
                  />
                )}
                {theme && themeType === 'color' && (
                  <div
                    className="mt-2 w-full h-10 rounded border border-gray-300"
                    style={{ backgroundColor: theme }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
