import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'כתובת אימייל לא תקינה' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ error: 'כתובת האימייל כבר רשומה' }, { status: 409 });
      } else {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { email: email.toLowerCase() },
          data: { active: true },
        });
        return NextResponse.json({ message: 'נרשמת בהצלחה!' });
      }
    }

    // Create new subscription
    await prisma.newsletter.create({
      data: {
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json({ message: 'נרשמת בהצלחה!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'שגיאה בהרשמה, נסה שוב' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await prisma.newsletter.findMany({
      where: { active: true },
      select: {
        email: true,
        subscribedAt: true,
      },
      orderBy: { subscribedAt: 'desc' },
    });

    return NextResponse.json({ count: subscribers.length, subscribers });
  } catch (error) {
    console.error('Newsletter fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
