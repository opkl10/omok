import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostEditor from '@/components/PostEditor';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">עריכת פוסט</h1>
      <PostEditor
        post={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          featuredImage: post.featuredImage || '',
          status: post.status,
          categoryId: post.categoryId || '',
        }}
        categories={categories}
      />
    </div>
  );
}
