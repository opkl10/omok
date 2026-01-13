import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ThemeProvider from '@/components/ThemeProvider';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </ThemeProvider>
    </Providers>
  );
}
