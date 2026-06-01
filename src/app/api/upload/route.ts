import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Check file extension to ensure it is HTML
    const originalName = file.name;
    const lowerName = originalName.toLowerCase();
    if (!lowerName.endsWith('.html') && !lowerName.endsWith('.htm')) {
      return NextResponse.json({ error: 'Only HTML files (.html, .htm) are allowed' }, { status: 400 });
    }

    // Upload directly to Vercel Blob with public read permission
    // addRandomSuffix adds a unique string to prevent overwriting existing files
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      file: {
        name: blob.pathname,
        originalName: originalName,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: blob.url
      }
    });
  } catch (error: any) {
    console.error('Error uploading file to Vercel Blob:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
