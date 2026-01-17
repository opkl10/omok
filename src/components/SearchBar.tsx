'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatReadingTime } from '@/lib/blog-utils';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
  category: { name: string } | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchPosts = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.posts || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchPosts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש פוסטים..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {query.length >= 2 ? 'לא נמצאו תוצאות' : 'הקלד לפחות 2 תווים לחיפוש'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-3">
                    {post.featuredImage && (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{post.title}</h4>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        {post.category && <span>{post.category.name}</span>}
                        {post.category && post.readingTime && <span>•</span>}
                        {post.readingTime && <span>{formatReadingTime(post.readingTime)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
