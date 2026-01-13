import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-bold text-black mt-4">העמוד לא נמצא</h2>
        <p className="text-black mt-2 mb-8">
          מצטערים, העמוד שחיפשת אינו קיים או הוסר.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            חזרה לדף הבית
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            לבלוג
          </Link>
        </div>
      </div>
    </div>
  );
}
