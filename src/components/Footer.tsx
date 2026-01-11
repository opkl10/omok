import prisma from '@/lib/prisma';

async function getSettings() {
  const settings = await prisma.settings.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((setting) => {
    settingsMap[setting.key] = setting.value;
  });
  return settingsMap;
}

export default async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          {settings.footerText ? (
            <p className="text-gray-400">{settings.footerText}</p>
          ) : (
            <p className="text-gray-400">
              {settings.siteName || 'הבלוג שלי'} &copy; {year}. כל הזכויות שמורות.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
