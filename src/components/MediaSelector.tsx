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

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  allowVideos?: boolean;
}

export default function MediaSelector({ isOpen, onClose, onSelect, allowVideos = true }: MediaSelectorProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

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

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia.url);
      onClose();
    }
  };

  const filteredMedia = media.filter((item) => {
    if (filter === 'image') return item.mimeType.startsWith('image/');
    if (filter === 'video') return item.mimeType.startsWith('video/');
    return allowVideos ? true : item.mimeType.startsWith('image/');
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">בחר מדיה</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'image' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              תמונות
            </button>
            {allowVideos && (
              <button
                onClick={() => setFilter('video')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'video' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                סרטונים
              </button>
            )}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={allowVideos ? "image/*,video/*" : "image/*"}
              multiple
              onChange={handleUpload}
              className="hidden"
              id="media-selector-upload"
            />
            <label
              htmlFor="media-selector-upload"
              className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer text-sm ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {uploading ? 'מעלה...' : 'העלה קבצים +'}
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-8">טוען...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              אין קבצי מדיה. העלה קבצים להתחלה.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  onDoubleClick={() => {
                    setSelectedMedia(item);
                    handleSelect();
                  }}
                  className={`bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedMedia?.id === item.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
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
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                  <div className="p-1.5">
                    <div className="text-xs truncate" title={item.originalName}>
                      {item.originalName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedMedia ? (
              <span>נבחר: {selectedMedia.originalName}</span>
            ) : (
              <span>בחר קובץ או לחץ פעמיים כדי להוסיף</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
            >
              ביטול
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedMedia}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              בחר
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
