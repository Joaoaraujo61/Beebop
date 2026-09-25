// api/genius-search.js
//
// Proxy serverless para a Genius API — NÃO faz parte do app estático
// (fora da pasta js/**). Precisa ser publicado como função (Vercel
// Functions, Netlify Functions, Cloudflare Workers etc.), porque é o
// único lugar onde o GENIUS_ACCESS_TOKEN pode existir: uma variável de
// ambiente do servidor, nunca código enviado ao navegador.
//
// Exemplo pronto para Vercel (arquivo em /api na raiz do projeto — a
// Vercel publica automaticamente qualquer arquivo ali como endpoint).
// Se o hosting for outro, a lógica de dentro (fetch para api.genius.com
// com o token) é a mesma; só muda a assinatura de entrada/saída da
// função (req/res vira event/context em alguns provedores).
//
// Configuração necessária:
// 1. Criar um app em https://genius.com/api-clients
// 2. Copiar o "Client Access Token"
// 3. Definir GENIUS_ACCESS_TOKEN nas variáveis de ambiente do projeto
//    hospedado (nunca commitar o token no repositório)
//
// Este endpoint devolve só o que o front precisa para montar o link/
// embed (id, url, título, artista, capa) — o endpoint /search da
// Genius API nem devolve o texto da letra; a letra completa só existe
// na própria página da Genius (ou no widget oficial de embed deles).

export default async function handler(req, res) {
  const termo = req.query?.q;
  if (!termo) {
    res.status(400).json({ error: 'Parâmetro "q" é obrigatório.' });
    return;
  }

  const token = process.env.GENIUS_ACCESS_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'GENIUS_ACCESS_TOKEN não configurado no servidor.' });
    return;
  }

  try {
    const resposta = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(termo)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resposta.ok) {
      res.status(resposta.status).json({ error: 'Erro ao consultar a Genius API.' });
      return;
    }

    const dados = await resposta.json();
    res.status(200).json({ hits: dados.response?.hits ?? [] });
  } catch {
    res.status(502).json({ error: 'Falha ao conectar com a Genius API.' });
  }
}