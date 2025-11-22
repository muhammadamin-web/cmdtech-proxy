import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const upstream = await fetch('https://cmdtech.framer.website/');

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream site error' }, { status: 502 });
    }

    let html = await upstream.text();

    // Replace URLs
    html = html.replace(/https:\/\/ebb\.framer\.ai\//g, '/api/proxy/ebb.framer.ai/');
    html = html.replace(/https:\/\/framerusercontent\.com\//g, '/api/proxy/framerusercontent.com/');
    // Remove Framer attribution comment
    html = html.replace(/<!--\s*✨\s*Built with Framer\s*•\s*https:\/\/www\.framer\.com\/\s*-->/g, '');
    // Add Yandex Metrika
    const yandexMetrikaCode = `
      <!-- Yandex.Metrika counter -->
      <script type="text/javascript">
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(97023034, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:true
        });
      </script>
      <noscript><div><img src="https://mc.yandex.ru/watch/97023034" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
    `;
    html = html.replace(/<\/head>/i, `${yandexMetrikaCode}</head>`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Connection': 'close'
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: `Worker error: ${err.message}` }, { status: 500 });
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

export const runtime = 'edge';
