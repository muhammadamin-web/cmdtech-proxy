import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];
    const resourcePath = route.join('/');

    // Reconstruct the full URL from the proxy path
    // Example: /api/proxy/ebb.framer.ai/image.png -> https://ebb.framer.ai/image.png
    const upstreamUrl = `https://${resourcePath}`;

    // Fetch the resource
    const response = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return new NextResponse('Resource not found', { status: response.status });
    }

    // Get the content type from the upstream response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Get the response as ArrayBuffer
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return new NextResponse('Proxy error', { status: 500 });
  }
}

export async function HEAD(req: NextRequest, { params }: { params: { route: string[] } }) {
  return GET(req, { params });
}
