import prisma from '@/lib/prisma';
import PostEditor from '@/components/PostEditor';

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">פוסט חדש</h1>
      <PostEditor categories={categories} />
    </div>
  );
}
