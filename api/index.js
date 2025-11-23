export default async function handler(req, res) {
  // Endereço do seu Render
  const targetUrl = 'https://dashboard-barbearia-lb.onrender.com';

  try {
    // Busca a página original no Render
    const response = await fetch(targetUrl);
    let html = await response.text();

    // Código PWA para injetar
    const pwaCode = `
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

    // Injeta antes de fechar o cabeçalho
    html = html.replace('</head>', `${pwaCode}</head>`);

    // Retorna a página modificada
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Erro ao carregar o sistema: ' + error.message);
  }
}
