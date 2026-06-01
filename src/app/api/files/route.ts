import { list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

// GET: List all uploaded HTML files from Vercel Blob
export async function GET() {
  try {
    // List all blobs associated with the write token
    const { blobs } = await list();
    
    const htmlFiles = blobs.filter(blob => {
      const lower = blob.pathname.toLowerCase();
      return lower.endsWith('.html') || lower.endsWith('.htm');
    });
    
    const fileDetails = htmlFiles.map((blob) => ({
      name: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt.toISOString(),
      url: blob.url
    }));

    // Sort by upload date descending
    fileDetails.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({ files: fileDetails });
  } catch (error: any) {
    console.error('Error listing Vercel Blobs:', error);
    return NextResponse.json({ error: 'Failed to retrieve files' }, { status: 500 });
  }
}

// DELETE: Delete a specific file from Vercel Blob after password verification
export async function DELETE(req: Request) {
  try {
    const { filename, password } = await req.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'File identifier is required' }, { status: 400 });
    }
    
    // Verification of the deletion password
    if (password !== 'delete-secure-2026') {
      return NextResponse.json({ error: 'Incorrect deletion password' }, { status: 403 });
    }

    // Delete the file using its full Vercel Blob URL (passed as "filename")
    await del(filename);
    
    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting Vercel Blob:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete file' }, { status: 500 });
  }
}
