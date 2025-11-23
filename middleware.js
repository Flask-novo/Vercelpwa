import { next } from '@vercel/edge';

export default async function middleware(request) {
  const response = await next(request);
  const contentType = response.headers.get('content-type');

  // Só injeta o código se for uma página HTML
  if (contentType && contentType.includes('text/html')) {
    let text = await response.text();
    
    // Código PWA para injetar
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

    // Injeta logo antes de fechar o <head>
    text = text.replace('</head>', `${pwaScript}</head>`);
    
    return new Response(text, {
      headers: response.headers,
      status: response.status,
    });
  }

  return response;
}
