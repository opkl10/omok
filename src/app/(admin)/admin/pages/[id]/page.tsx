import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PageEditor from '@/components/PageEditor';

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">עריכת עמוד</h1>
      <PageEditor
        page={{
          id: page.id,
          title: page.title,
          content: page.content,
          status: page.status,
          template: page.template,
        }}
      />
    </div>
  );
}
