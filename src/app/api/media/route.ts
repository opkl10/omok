import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isCloudinaryConfigured, uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(media);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime', // .mov files
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: images (JPEG, PNG, GIF, WebP, SVG) and videos (MP4, WebM, OGG, MOV)'
      }, { status: 400 });
    }

    // Different max sizes for images and videos
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for images
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max size: ${isVideo ? '100MB' : '10MB'}`
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;

    let url: string;
    let cloudinaryId: string | null = null;
    let storageType: 'local' | 'cloudinary' = 'local';

    // Use Cloudinary if configured, otherwise fall back to local storage
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadToCloudinary(buffer, filename, file.type);
        url = uploadResult.url;
        cloudinaryId = uploadResult.publicId;
        storageType = 'cloudinary';
      } catch (uploadError) {
        console.error('Cloudinary upload failed, falling back to local:', uploadError);
        // Fall back to local storage if Cloudinary fails
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        url = `/uploads/${filename}`;
      }
    } else {
      // Local storage fallback
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      url = `/uploads/${filename}`;
    }

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        storageType,
        cloudinaryId,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Cloudinary if applicable
    if (media.storageType === 'cloudinary' && media.cloudinaryId) {
      await deleteFromCloudinary(media.cloudinaryId);
    } else if (media.storageType === 'local') {
      // Delete file from local disk
      const filepath = path.join(process.cwd(), 'public', media.url);
      const { unlink } = await import('fs/promises');
      try {
        await unlink(filepath);
      } catch {
        // File might not exist, continue anyway
      }
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
