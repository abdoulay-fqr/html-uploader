import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return new Response('URL parameter is required', { status: 400 });
    }

    // Fetch the raw HTML from Vercel Blob
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(`Failed to fetch file: ${response.statusText}`, { status: response.status });
    }

    const htmlContent = await response.text();

    // Return the HTML content directly with text/html content-type
    // This forces the browser to render it inline inside an iframe or tab
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Error in raw file proxy endpoint:', error);
    return new Response('Error retrieving file content', { status: 500 });
  }
}
