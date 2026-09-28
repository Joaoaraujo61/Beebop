// js/data/perfilMock.js
//
// Dados MOCKADOS da página de Perfil (o contexto do projeto indica que a
// alimentação do "DNA Musical" com dados reais ainda está pendente, e não
// existe backend de usuários). Trocar por dados reais quando existirem.

/** DNA Musical fictício do usuário logado. */
export const DNA_MOCK = {
  score: 94,
  genres: [
    { label: 'MPB', value: 0.9 },
    { label: 'Indie', value: 0.6 },
    { label: 'Eletrônica', value: 0.5 },
    { label: 'Hip-Hop', value: 0.7 },
    { label: 'Jazz', value: 0.4 },
  ],
  decades: [
    { label: '70s', value: 82 },
    { label: '80s', value: 64 },
    { label: '90s', value: 91 },
    { label: '00s', value: 45 },
    { label: '10s', value: 58 },
    { label: '20s', value: 39 },
  ],
  artists: ['MC LAN', 'VOLTA', 'Setor 7', 'Ruído Azul', 'Maré Alta'],
  moods: [
    { label: 'Melancólico', value: 34 },
    { label: 'Eufórico', value: 26 },
    { label: 'Introspectivo', value: 22 },
    { label: 'Dançante', value: 18 },
  ],
  blurb: 'faixas lentas, harmonias densas e vozes ao fundo.',
  profileName: 'Melancólico Noturno',
};

/** Usuários fictícios sugeridos por afinidade musical. */
export const SIMILAR_USERS = [
  { id: 'sim_1', nome: 'Helena Duarte', usuario: 'helena.duarte', afinidade: 94, generos: ['MPB', 'Jazz'], artistas: ['Maré Alta', 'Ruído Azul'], bio: 'Vinil aos domingos e café sem açúcar.' },
  { id: 'sim_2', nome: 'Caio Ventura', usuario: 'caio_ventura', afinidade: 89, generos: ['Hip-Hop', 'Indie'], artistas: ['MC LAN', 'VOLTA'], bio: 'Colecionando rimas e capas de álbum.' },
  { id: 'sim_3', nome: 'Marina Salles', usuario: 'marinasalles', afinidade: 86, generos: ['Indie', 'Eletrônica'], artistas: ['Setor 7'], bio: 'Playlists para chuva e madrugada.' },
  { id: 'sim_4', nome: 'Rafael Timóteo', usuario: 'rafa.timoteo', afinidade: 81, generos: ['MPB', 'Hip-Hop'], artistas: ['VOLTA', 'Maré Alta'], bio: 'Descobrindo um artista novo por semana.' },
  { id: 'sim_5', nome: 'Luísa Arantes', usuario: 'luisa_arantes', afinidade: 77, generos: ['Jazz', 'Eletrônica'], artistas: ['Ruído Azul'], bio: 'Nota 10 pra álbum que vale o disco inteiro.' },
  { id: 'sim_6', nome: 'Théo Bastos', usuario: 'theo.bastos', afinidade: 72, generos: ['Indie', 'Jazz'], artistas: ['Setor 7', 'Maré Alta'], bio: 'Show pequeno > estádio.' },
];