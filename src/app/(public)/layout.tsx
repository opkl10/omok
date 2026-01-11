import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
