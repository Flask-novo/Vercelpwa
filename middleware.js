import { next } from '@vercel/edge';

// CONFIGURAÇÃO DE SEGURANÇA
// Isto obriga o middleware a rodar APENAS na raiz do site.
// Ele vai ignorar automaticamente websockets, arquivos estáticos e subpáginas.
export const config = {
  matcher: '/',
};

export default async function middleware(request) {
  const response = await next(request);
  const contentType = response.headers.get('content-type');

  // Verifica se é uma página HTML antes de mexer
  if (contentType && contentType.includes('text/html')) {
    let text = await response.text();
    
    // Injeta o PWA
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

    // Substitui e retorna
    text = text.replace('</head>', `${pwaScript}</head>`);
    
    return new Response(text, {
      headers: response.headers,
      status: response.status,
    });
  }

  return response;
}
