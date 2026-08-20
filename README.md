# 🎧 Beebop

**Beebop** é um catálogo de músicas online focado em oferecer uma experiência de navegação organizada e intuitiva para consulta de artistas, álbuns e músicas. A aplicação permite avaliar, comentar, salvar seus álbuns e músicas preferidas, além de encontrar pessoas com gostos musicais semelhantes através de perfis e do "DNA Musical".

O projeto é desenvolvido como parte do programa **Serasa Experian - Transforme-se**, em parceria com o SENAC-DF, unindo a teoria acadêmica à prática de mercado por meio da construção de uma interface moderna e funcional.

> ⚠️ **Status do projeto: em desenvolvimento**
> O Beebop está atualmente na fase de construção do MVP (Produto Mínimo Viável). Novas funcionalidades, páginas e ajustes visuais ainda estão sendo implementados. Consulte a seção [Status atual](#-status-atual-do-mvp) para saber o que já está disponível.

---

## 📌 Objetivo

Construir um MVP funcional, **100% client-side**, que consuma dados da [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) para busca, filtragem, ordenação e exibição de detalhes de músicas, artistas e álbuns.

## 👥 Público-alvo

Jovens adultos de até 35 anos, entusiastas da música que preferem dados reais de audição a recomendações puramente guiadas por tendências virais, e ouvintes dedicados que gostam de catalogar e discutir seus artistas e obras preferidas.

## ✨ Funcionalidades

- 🔎 Busca de músicas, artistas e álbuns via iTunes Search API
- 🗂️ Filtro por categoria (Todos, Músicas, Artistas, Álbuns, Letras)
- ↕️ Ordenação de resultados (nome, artista, data)
- 📄 Paginação client-side
- 🎵 Página de detalhes com reprodução de prévia de áudio
- 👤 Cadastro e login de usuário
- ⭐ Avaliação de músicas, álbuns, artistas e playlists
- 💬 Comentários
- 💾 Salvar conteúdos favoritos
- 🧬 DNA Musical, gerado a partir das avaliações do usuário
- 🏆 Ranking dos conteúdos mais populares
- 🔗 Compartilhamento de conteúdos
- ➕ Criação de playlists públicas
- 🤝 Seguir outros perfis

## 🚧 Status atual do MVP

| Área | Situação |
|---|---|
| Estrutura base (HTML/CSS/JS) | ✅ Implementada |
| Integração com iTunes Search API | ✅ Implementada |
| Páginas de Início, Explorar, Música, Álbum, Artista, Playlist, Perfil | 🔄 Em desenvolvimento |
| Ranking (Charts) | 🔄 Em desenvolvimento |
| Cadastro / Login | ⏳ Planejado |
| Avaliações, comentários e salvamento | ⏳ Planejado |
| DNA Musical | ⏳ Planejado |
| Back-end e banco de dados | ⏳ Fora do escopo do MVP (evolução futura) |

Legenda: ✅ concluído · 🔄 em andamento · ⏳ planejado / não iniciado

## 🛠️ Tecnologias utilizadas

- **HTML5** — estrutura e marcação semântica
- **CSS3** — estilização, Grid e Flexbox para responsividade
- **JavaScript (ES6+)** — lógica, interatividade e consumo da API
- **iTunes Search API** — fonte de dados musicais (músicas, artistas, álbuns, prévias)

**Ferramentas auxiliares:** Visual Studio Code, Git, GitHub e Figma (wireframes e protótipos).

> Em versões futuras está prevista a evolução para uma arquitetura cliente-servidor, com back-end próprio (possivelmente em **Laravel**) e banco de dados (possivelmente **MySQL**).

## 🎨 Identidade visual

- **Tema:** Dark Theme
- **Cores:** fundo preto `#08080B` com detalhes dourados `#E9B949`
- **Tipografia:** Fraunces, Inter e JetBrains Mono

## 📁 Estrutura do projeto

```
beebop/
├── index.html                 # Ponto de entrada da aplicação
├── css/
│   ├── style.css               # Estilos globais
│   ├── components.css          # Estilos dos componentes
│   └── responsive.css          # Regras de responsividade (media queries)
├── js/
│   ├── app.js                  # Inicialização da aplicação
│   ├── pages/                  # Lógica de cada página
│   │   ├── Inicio/
│   │   ├── Explorar/
│   │   ├── Musica/
│   │   ├── Album/
│   │   ├── Artista/
│   │   ├── Playlist/
│   │   ├── Perfil/
│   │   └── Charts/
│   ├── components/             # Componentes reutilizáveis de UI
│   │   ├── header.js
│   │   ├── footer.js
│   │   ├── searchBar.js
│   │   ├── musicCard.js
│   │   ├── albumCard.js
│   │   ├── artistCard.js
│   │   ├── playlistCard.js
│   │   ├── player.js
│   │   └── pagination.js
│   ├── services/
│   │   └── itunesApi.js        # Comunicação com a iTunes Search API
│   ├── store/
│   │   └── appState.js         # Gerenciamento de estado da aplicação
│   └── utils/                  # Funções utilitárias
│       ├── formatters.js
│       ├── helpers.js
│       ├── validators.js
│       ├── constants.js
│       └── pagination.js
└── README.md
```

## ▶️ Como executar o projeto localmente

Como o MVP é uma aplicação 100% client-side, não há necessidade de instalar dependências de back-end.

1. Clone o repositório:
   ```bash
   git clone https://github.com/<usuario>/Beebop.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd Beebop
   ```
3. Abra o arquivo `index.html` diretamente no navegador **ou** utilize uma extensão como o [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code para uma melhor experiência de desenvolvimento (recarregamento automático).

> Nenhuma variável de ambiente é necessária no momento, pois a integração é feita diretamente com a iTunes Search API, que é pública e não exige chave de autenticação.

## 🗺️ Roadmap

- [ ] Finalizar páginas principais (Início, Explorar, Detalhes)
- [ ] Implementar cadastro e login de usuários
- [ ] Implementar avaliações, comentários e salvamento de conteúdos
- [ ] Implementar criação de playlists públicas
- [ ] Implementar DNA Musical
- [ ] Implementar ranking de conteúdos populares
- [ ] Evoluir para arquitetura cliente-servidor (back-end + banco de dados)

## 📄 Documentação

A documentação técnica completa do projeto (visão geral, requisitos funcionais e não funcionais, casos de uso e arquitetura) está disponível separadamente na documentação técnica do Beebop.


Projeto desenvolvido como Projeto Integrador (PI) do programa **Serasa Experian - Transforme-se**, em parceria com o **SENAC-DF**.
