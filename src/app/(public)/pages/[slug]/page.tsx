import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

async function getPage(slug: string) {
  return prisma.page.findUnique({ where: { slug, status: 'published' }, include: { author: { select: { name: true } } } });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <article className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mt-2 mb-4">{page.title}</h1>
        </header>

        {page.headerColor && (
          <div style={{ backgroundColor: page.headerColor }} className="h-48 mb-8 rounded-lg" />
        )}

        {page.featuredImage && (
          <div className="mb-8">
            <img src={page.featuredImage} alt={page.title} className="w-full h-auto rounded-lg shadow-lg" />
          </div>
        )}

        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </article>
  );
}
