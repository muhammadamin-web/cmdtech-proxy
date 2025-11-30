// app/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch('https://cmdtech.framer.website/', {
      headers: {
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return new NextResponse('Upstream site error', { status: 502 });
    }

    let html = await response.text();

    // CDN URLlarini almashtiramiz
  // Rewrite all external URLs to go through the CDN proxy
  // This catches all http(s) URLs in HTML attributes, stylesheets, and inline styles
  html = html.replace(/(https?:\/\/[^\s"'<>{}|\\^`\]\[]+)/g, (url) => {
    // Skip URLs that are already pointing to our CDN proxy or are data URLs
    if (url.includes('/cdn/') || url.startsWith('data:')) {
      return url;
    }
    // Convert all external URLs to use our CDN proxy
    return `/cdn/${encodeURIComponent(url)}`;
  });    
    // Framer badgesini o'chiramiz
    html = html.replace(/<!--\s*✨\s*Built with Framer.*?-->/g, '');
    html = html.replace(/<div id="__framer-badge-container"[^>]*>.*?<\/div>/gi, '');
    html = html.replace(/<meta[^>]*name="robots"[^>]*>/gi, '');

    // Yandex Metrika qo'shamiz
    const yandexMetrikaCode = `
      <script type="text/javascript">
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
        ym(97023034,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
      </script>
      <noscript><div><img src="https://mc.yandex.ru/watch/97023034" style="position:absolute;left:-9999px;" alt=""/></div></noscript>
    `;
    
    html = html.replace(/<\/head>/i, `${yandexMetrikaCode}</head>`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
