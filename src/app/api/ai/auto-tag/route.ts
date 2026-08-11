import { NextResponse } from 'next/server';
import { analyzeItemPhoto } from '@/lib/ai/vision';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image base64 payload is required' }, { status: 400 });
    }

    const tagResults = await analyzeItemPhoto(image, mimeType);
    return NextResponse.json({ success: true, data: tagResults });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to auto-tag image';
    console.error('Error processing AI auto-tag:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
