import { NextRequest, NextResponse } from 'next/server';

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

    // Replace all Framer CDN URLs - point to /proxy endpoint for assets
    html = html.replace(/https:\/\/ebb\.framer\.ai\//g, '/proxy/ebb.framer.ai/');
    html = html.replace(/https:\/\/framerusercontent\.com\//g, '/proxy/framerusercontent.com/');

    // Remove Framer attribution comment
    html = html.replace(/<!--\s*✨\s*Built with Framer\s*•\s*https:\/\/www\.framer\.com\/\s*-->/g, '');

    // Remove Framer badge
    html = html.replace(/<div id="__framer-badge-container"[^>]*>.*?<\/div>/gi, '');

    // Remove robots meta
    html = html.replace(/<meta[^>]*name="robots"[^>]*>/gi, '');

    // Inject Yandex.Metrika tracking code
    const yandexMetrikaCode = `<!-- Yandex.Metrika counter --><script type="text/javascript" > (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
 m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
 (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
 ym(97023034, "init", {
 clickmap:true,
 trackLinks:true,
 accurateTrackBounce:true,
 webvisor:true
 });</script><noscript><div><img src="https://mc.yandex.ru/watch/97023034" style="position:absolute; left:-9999px;" alt="" /></div></noscript><!-- /Yandex.Metrika counter --> `;
    html = html.replace(/<\/head>/i, `${yandexMetrikaCode}</head>`);

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
    console.error('Proxy error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
