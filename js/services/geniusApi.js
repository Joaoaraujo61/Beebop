// js/services/geniusApi.js
//
// Integração com a Genius API para localizar a letra de uma faixa.
//
// IMPORTANTE — por que isso não é um fetch direto como itunesApi.js:
// 1) A Genius API exige autenticação (Client Access Token) enviada no
//    header Authorization. Um token colocado direto no código do
//    navegador fica visível para qualquer visitante — inaceitável para
//    uma credencial de API.
// 2) api.genius.com não libera CORS para chamadas feitas a partir do
//    navegador (diferente da iTunes Search API, que já responde com
//    Access-Control-Allow-Origin: *). Um fetch direto a partir daqui
//    falha por política de CORS, independente do token.
//
// Por isso essa busca passa por um proxy próprio (função serverless),
// que guarda o token no servidor e só repassa ao cliente o que já é
// público: o id da música no Genius, a url da página e metadados
// (título/artista/capa). Ver /api/genius-search.js (exemplo de proxy em
// formato de função da Vercel) para o outro lado dessa integração — ele
// PRECISA ser publicado separadamente, com GENIUS_ACCESS_TOKEN
// configurado como variável de ambiente do servidor. Enquanto o proxy
// não estiver publicado, buscarLetraGenius() falha graciosamente
// (retorna null) e a página de Música mostra o estado "letra
// indisponível" em vez de quebrar.
//
// A letra em si NUNCA passa por aqui nem é guardada pelo Beebop: quem
// renderiza o texto é o próprio widget oficial de embed da Genius (ver
// pages/Musica/musica.js), carregado a partir de genius.com — os termos
// da Genius não permitem reproduzir/copiar o texto da letra fora da
// própria página/embed deles.

// Ajuste para a URL real do seu proxy depois de publicá-lo (ex:
// 'https://seu-projeto.vercel.app/api/genius-search'). Se o proxy for
// servido pelo mesmo domínio do app, o caminho relativo abaixo basta.
const GENIUS_PROXY_URL = '/api/genius-search';

/**
 * Busca a melhor correspondência de uma faixa na Genius.
 * @param {string} artista
 * @param {string} titulo
 * @returns {Promise<{geniusId: number, geniusUrl: string, tituloGenius: string, artistaGenius: string, capaGenius: string|null}|null>}
 */
export async function buscarLetraGenius(artista, titulo) {
  if (!artista?.trim() || !titulo?.trim()) return null;

  const termo = `${artista} ${titulo}`;
  const url = `${GENIUS_PROXY_URL}?q=${encodeURIComponent(termo)}`;

  let resposta;
  try {
    resposta = await fetch(url);
  } catch (erro) {
    // Proxy fora do ar / ainda não publicado / bloqueio de rede.
    console.warn('Não foi possível consultar o proxy da Genius:', erro.message);
    return null;
  }

  if (!resposta.ok) return null;

  let dados;
  try {
    dados = await resposta.json();
  } catch {
    return null;
  }

  const hit = dados?.hits?.[0]?.result;
  if (!hit) return null;

  return {
    geniusId: hit.id,
    geniusUrl: hit.url,
    tituloGenius: hit.title,
    artistaGenius: hit.primary_artist?.name ?? artista,
    capaGenius: hit.song_art_image_thumbnail_url ?? null,
  };
}