import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

async function getPage(slug: string) {
  return prisma.page.findUnique({
    where: { slug, status: 'published' },
    include: {
      author: { select: { name: true } },
    },
  });
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  const isFullWidth = page.template === 'full-width';

  return (
    <article className="py-12 bg-white min-h-screen">
      <div className={`mx-auto px-4 ${isFullWidth ? 'max-w-full' : 'max-w-4xl'}`}>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold">{page.title}</h1>
        </header>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return { title: 'עמוד לא נמצא' };
  }

  return {
    title: page.title,
  };
}
