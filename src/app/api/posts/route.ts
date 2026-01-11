import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');

  const where = status ? { status } : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, excerpt, featuredImage, status, categoryId, theme, themeType } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    let slug = slugify(title, { lower: true, strict: true });

    // Ensure unique slug
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null,
        authorId: session.user.id,
        categoryId: categoryId || null,
        theme: theme || null,
        themeType: themeType || 'color',
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
