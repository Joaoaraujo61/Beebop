// js/data/curatedNews.js
//
// Notícias musicais para a página Notícias. Assim como reviews e
// autenticação, não existe um serviço/backend de notícias real no
// projeto — os itens abaixo são editoriais, escritos à mão a partir de
// anúncios públicos reais de lançamentos de 2026 (não são textos
// inventados), mas sem vir de uma fonte automatizada/API de notícias.
// É dado mockado, apenas para exibição no MVP — mesmo espírito de
// js/data/curatedSelections.js.
//
// A capa de cada notícia é enriquecida com a arte real do álbum
// relacionado via iTunes API, através do único ponto de acesso permitido
// no projeto: services/itunesApi.js.

import { buscarAlbuns } from '../services/itunesApi.js';

const NOTICIAS_BASE = [
  {
    id: 'noticia-bts-retorno',
    tag: 'Notícia',
    titulo: 'BTS confirma álbum de retorno com 14 faixas inéditas',
    resumo: 'Após o fim do serviço militar obrigatório dos integrantes, a empresa responsável pelo grupo anunciou que o novo disco reúne 14 canções inéditas e chegou às plataformas em 20 de março.',
    termoBusca: 'BTS',
    publicadoEm: '2026-03-20',
  },
  {
    id: 'noticia-blackpink-deadline',
    tag: 'Notícia',
    titulo: 'Blackpink lança "Deadline", primeiro álbum desde 2022',
    resumo: 'O novo trabalho do quarteto sul-coreano chegou em 14 de fevereiro e marca o retorno do grupo aos estúdios desde "Born Pink".',
    termoBusca: 'Blackpink Deadline',
    publicadoEm: '2026-02-14',
  },
  {
    id: 'noticia-mumford-prizefighter',
    tag: 'Notícia',
    titulo: 'Mumford & Sons anuncia "Prizefighter" com participações de Hozier e Gracie Abrams',
    resumo: 'O sexto álbum de estúdio da banda de folk rock chegou em 13 de fevereiro com 14 faixas e colaborações de Chris Stapleton, Gracie Abrams, Gigi Perez e Hozier.',
    termoBusca: 'Mumford and Sons Prizefighter',
    publicadoEm: '2026-02-13',
  },
  {
    id: 'noticia-luisa-sonza-bossa',
    tag: 'Notícia',
    titulo: 'Luísa Sonza mergulha na bossa nova em parceria com Roberto Menescal e Toquinho',
    resumo: '"Bossa Sempre Nova" chegou em 13 de janeiro e reúne a cantora com dois dos maiores nomes da bossa nova brasileira, num projeto que ela descreve como algo que já vinha fazendo "de forma natural".',
    termoBusca: 'Luísa Sonza',
    publicadoEm: '2026-01-13',
  },
  {
    id: 'noticia-asap-rocky-dumb',
    tag: 'Notícia',
    titulo: "A$AP Rocky lança \"Don't Be Dumb\" após meses de expectativa",
    resumo: 'O rapper vinha aquecendo o lançamento desde agosto do ano anterior com singles como "Tailor Swif". O álbum chegou em 16 de janeiro.',
    termoBusca: "A$AP Rocky Don't Be Dumb",
    publicadoEm: '2026-01-16',
  },
  {
    id: 'noticia-robbie-williams-britpop',
    tag: 'Notícia',
    titulo: 'Robbie Williams presta homenagem ao britpop em novo álbum',
    resumo: '"Britpop" chegou em 6 de fevereiro como uma declaração de amor ao rock britânico dos anos 90 — um projeto que o artista queria lançar ainda em 1995, logo após deixar o Take That.',
    termoBusca: 'Robbie Williams Britpop',
    publicadoEm: '2026-02-06',
  },
  {
    id: 'noticia-lana-del-rey-novo-album',
    tag: 'Notícia',
    titulo: 'Lana Del Rey confirma novo álbum como sucessor de "Ocean Blvd"',
    resumo: 'Em entrevista, a cantora revelou que o disco — que já passou por nomes como "Lasso" e "The Right Person Will Stay" — está previsto para o início de 2026, ainda sem data oficial de lançamento.',
    termoBusca: 'Lana Del Rey',
    publicadoEm: '2026-01-05',
  },
  {
    id: 'noticia-bjork-echolalia',
    tag: 'Notícia',
    titulo: 'Björk prepara primeiro álbum desde "Fossora" com estreia na Islândia',
    resumo: 'O novo projeto, ainda em produção, deve ter sua primeira apresentação em maio, no Festival de Arte de Reykjavík, como parte de "Echolalia", uma exposição colaborativa com o artista plástico James Merry.',
    termoBusca: 'Björk',
    publicadoEm: '2026-01-20',
  },
];

/** Enriquece uma notícia com a capa real do álbum/artista buscado na iTunes API. */
async function enriquecerComCapa(noticia) {
  try {
    const [encontrado] = await buscarAlbuns(noticia.termoBusca, { limit: 1 });
    return { ...noticia, capa: encontrado ? encontrado.capa : null };
  } catch {
    return { ...noticia, capa: null }; // fallback: placeholder no componente
  }
}

/**
 * Devolve as notícias mockadas, das mais recentes para as mais antigas,
 * já com a capa enriquecida pela iTunes API.
 * @param {number} [quantidade] - Padrão: todas as notícias disponíveis.
 * @returns {Promise<Array>}
 */
export async function getNoticias(quantidade = NOTICIAS_BASE.length) {
  const ordenadas = [...NOTICIAS_BASE].sort(
    (a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm)
  );
  const selecionadas = ordenadas.slice(0, quantidade);
  return Promise.all(selecionadas.map(enriquecerComCapa));
}
