import prisma from '@/lib/prisma';

async function getSettings() {
  const settings = await prisma.settings.findMany();
  const map: Record<string,string> = {};
  settings.forEach(s => (map[s.key] = s.value));
  return map;
}

export default async function NotFound() {
  const settings = await getSettings();
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{settings['404Title'] || '404 - לא נמצא'}</h1>
        <p className="text-lg text-gray-600">{settings['404Message'] || 'העמוד אינו קיים.'}</p>
      </div>
    </div>
  );
}
