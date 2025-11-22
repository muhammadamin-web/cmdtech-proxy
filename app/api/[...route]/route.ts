import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Fetch from Framer website
    const response = await fetch('https://cmdtech.framer.website/', {
      headers: {
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return new NextResponse('Upstream site error', { status: 502 });
    }

    let html = await response.text();

    // Replace CDN URLs
    html = html.replace(/https:\/\/ebb\.framer\.ai\//g, 'https://cmdtech.uz/');
    
    // Remove Framer attribution comment
    html = html.replace(/<!-- ✨ Built with Framer • https:\/\/www\.framer\.com\/ -->/g, '');

    // Inject Yandex.Metrika tracking code
    const yandexMetrikaCode = `
      <!-- Yandex.Metrika counter -->
      <script type="text/javascript">
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};\n        m[i].l=1*new Date();\n        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}\n        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})\n        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");\n        ym(97023034, "init", {\n          clickmap:true,\n          trackLinks:true,\n          accurateTrackBounce:true,\n          webvisor:true\n        });\n      </script>\n      <noscript><div><img src="https://mc.yandex.ru/watch/97023034" style="position:absolute; left:-9999px;" alt="" /></div></noscript>\n    `;
    html = html.replace(/<\/head>/i, `${yandexMetrikaCode}</head>`);

    // Remove Framer badge
    html = html.replace(/<div id="__framer-badge-container"[^>]*>.*?<\/div>/is, '');
    
    // Remove robots meta
    html = html.replace(/<meta[^>]*name="robots"[^>]*>/gi, '');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'Connection': 'close',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new NextResponse(`Worker error:\n${err}`, {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

export async function PUT(req: NextRequest) {
  return GET(req);
}

export async function DELETE(req: NextRequest) {
  return GET(req);
}
