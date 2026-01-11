import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Forward file to notify upload endpoint
    const notifyUrl = process.env.NOTIFY_UPLOAD_URL;
    const notifyKey = process.env.NOTIFY_API_KEY;

    if (!notifyUrl) {
      return NextResponse.json({ error: 'Notify upload URL not configured' }, { status: 500 });
    }

    const uploadForm = new FormData();
    // @ts-ignore - Blob is accepted by fetch
    uploadForm.append('file', file, (file as any).name || 'upload');

    const headers: Record<string, string> = {};
    if (notifyKey) headers['Authorization'] = `Bearer ${notifyKey}`;

    const res = await fetch(notifyUrl, {
      method: 'POST',
      headers,
      body: uploadForm as any,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Notify upload failed:', text);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const payload = await res.json().catch(async () => ({ url: await res.text() }));
    const fileUrl = payload.url || payload.fileUrl || payload.location || (await res.text());

    // Create Media record
    const media = await prisma.media.create({
      data: {
        filename: (file as any).name || 'upload',
        originalName: (file as any).name || 'upload',
        mimeType: (file as any).type || 'application/octet-stream',
        size: Number((file as any).size) || 0,
        url: fileUrl,
        storageType: 'notify',
      },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
