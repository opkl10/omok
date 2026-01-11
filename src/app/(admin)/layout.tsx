import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Only admins can access the admin panel
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <Providers>
      <div className="flex min-h-screen" dir="rtl">
        <AdminSidebar />
        <main className="flex-1 bg-gray-100 p-6">{children}</main>
      </div>
    </Providers>
  );
}
