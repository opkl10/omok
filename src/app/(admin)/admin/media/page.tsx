'use client';

import { useState, useEffect, useRef } from 'react';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media');
      const data = await response.json();
      setMedia(data);
    } catch (error) {
      console.error('Fetch media error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          alert(`שגיאה בהעלאת ${file.name}: ${data.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`שגיאה בהעלאת ${file.name}`);
      }
    }

    setUploading(false);
    fetchMedia();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קובץ זה?')) return;

    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchMedia();
        if (selectedMedia?.id === id) {
          setSelectedMedia(null);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    alert('הכתובת הועתקה ללוח');
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ספריית מדיה</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {uploading ? 'מעלה...' : 'העלה קבצים +'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {media.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              אין קבצי מדיה עדיין. העלה קבצים להתחלה.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer border-2 transition-colors ${
                    selectedMedia?.id === item.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                    {item.mimeType.startsWith('video/') ? (
                      <>
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.originalName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-sm truncate" title={item.originalName}>
                      {item.originalName}
                    </div>
                    <div className="text-xs text-gray-500">{formatFileSize(item.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedMedia ? (
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <h3 className="font-medium mb-4">פרטי קובץ</h3>
              <div className="aspect-video bg-gray-100 rounded mb-4 flex items-center justify-center">
                {selectedMedia.mimeType.startsWith('video/') ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">שם: </span>
                  {selectedMedia.originalName}
                </div>
                <div>
                  <span className="text-gray-500">גודל: </span>
                  {formatFileSize(selectedMedia.size)}
                </div>
                <div>
                  <span className="text-gray-500">סוג: </span>
                  {selectedMedia.mimeType}
                </div>
                <div>
                  <span className="text-gray-500">תאריך: </span>
                  {new Date(selectedMedia.createdAt).toLocaleDateString('he-IL')}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => copyToClipboard(selectedMedia.url)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                >
                  העתק כתובת URL
                </button>
                <button
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                >
                  מחק קובץ
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
              בחר קובץ לצפייה בפרטים
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
