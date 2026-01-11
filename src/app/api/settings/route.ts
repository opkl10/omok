import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const settings = await prisma.settings.findMany();
  const map: Record<string, string> = {};
  settings.forEach((s) => (map[s.key] = s.value));
  return NextResponse.json(map);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    // data expected: { key: string, value: string }
    if (Array.isArray(data)) {
      // bulk upsert
      const upserts = await Promise.all(
        data.map(async (item: any) =>
          prisma.settings.upsert({
            where: { key: item.key },
            update: { value: item.value },
            create: { key: item.key, value: item.value },
          })
        )
      );
      return NextResponse.json(upserts);
    }

    const { key, value } = data;
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

    const result = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
