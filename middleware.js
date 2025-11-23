import { next } from '@vercel/edge';

export default async function middleware(request) {
  const url = new URL(request.url);

  // REGRA DE OURO: Só mexe se for a página inicial (raiz)
  // Isso impede que ele trave os dados do Streamlit (/_stcore/...)
  if (url.pathname !== '/') {
    return next(request);
  }

  const response = await next(request);
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('text/html')) {
    let text = await response.text();
    
    // Injeta o PWA apenas na capa
    const pwaScript = `
      <link rel="manifest" href="/manifest.json">
      <meta name="theme-color" content="#005e6a">
      <script>
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
          });
        }
      </script>
    `;

    text = text.replace('</head>', `${pwaScript}</head>`);
    
    return new Response(text, {
      headers: response.headers,
      status: response.status,
    });
  }

  return response;
}
