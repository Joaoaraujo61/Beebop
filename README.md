<div align="center">

# 🐝 Beebop

### Catálogo Web de Músicas · Web Music Catalog

**🎓 Projeto Integrador** — Serasa *Transforme-se* × SENAC-DF

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![iTunes API](https://img.shields.io/badge/iTunes%20API-FA243C?style=for-the-badge&logo=apple-music&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel%20Functions-000000?style=for-the-badge&logo=vercel&logoColor=white)

[🇧🇷 Português](#-português) · [🇬🇧 English](#-english)

</div>

---

# 🇧🇷 Português

## 🎵 O que é o Beebop?

O **Beebop** é um **catálogo web de músicas** feito para quem ama música: busque álbuns, artistas e faixas, ouça prévias, **avalie, comente e salve seus favoritos** e descubra pessoas com gostos parecidos com os seus.

Este projeto é o nosso **Projeto Integrador**, desenvolvido no programa **Serasa Transforme-se** em parceria com o **SENAC-DF**.

## ✨ Destaques

- 🔎 **Explorar** — busca em tempo real, filtros, ordenação e paginação
- 💿 **Álbuns, Artistas e Músicas** — páginas de detalhe com dados reais do catálogo
- 🏆 **Charts** — rankings de álbuns e músicas
- 📰 **Notícias** — seleção curada do mundo da música
- ⭐ **Avaliações e comentários** — dê sua nota e opine
- 🎧 **Player** — prévias de áudio com controle de reprodução
- 📝 **Letras** — integração com Genius e Lyrics.ovh
- 👤 **Login, Cadastro e Perfil** — conta de usuário e itens salvos
- 📱 **Layout responsivo** — funciona em celular, tablet e desktop

## 🧰 Tecnologias

| Tecnologia | Para que usamos |
|---|---|
| **HTML5** | Estrutura das páginas |
| **CSS3** | Visual, animações e responsividade |
| **JavaScript (ES Modules)** | Lógica, componentes e navegação — sem framework |
| **iTunes Search API** | Catálogo de músicas, álbuns, artistas e prévias |
| **TheAudioDB** | Fotos de artistas |
| **Genius API** + **Lyrics.ovh** | Busca de letras |
| **Vercel Functions** | Proxy seguro para esconder o token da Genius |
| **localStorage** | Sessão, contas simuladas e favoritos no navegador |
| **Font Awesome** + **Google Fonts (Inter)** | Ícones e tipografia |

## 🗂️ Estrutura

```text
Beebop/
├── api/            # Função serverless (proxy da Genius)
├── assets/         # Imagens e identidade visual
├── css/            # style, components e responsive
├── js/
│   ├── components/ # Header, Player, Cards, Paginação...
│   ├── pages/      # Início, Explorar, Álbum, Artista, Música, Charts, Notícias, Perfil, Login...
│   ├── services/   # Acesso às APIs e autenticação
│   ├── store/      # Estado compartilhado (appState)
│   ├── data/       # Seleções e notícias curadas
│   └── utils/      # Formatadores, validadores e helpers
└── index.html      # Redireciona para a página inicial
```

## 🚀 Como rodar

O projeto usa ES Modules e `fetch`, então precisa de um servidor local (abrir o `index.html` direto do disco não funciona).

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/beebop.git
cd beebop

# 2. Suba um servidor local (escolha um)
python3 -m http.server 8080
# ou
npx serve .
```

Acesse **http://localhost:8080** 🎉

> 💡 **Letras via Genius (opcional):** publique `api/genius-search.js` como função serverless (ex.: Vercel) e defina a variável de ambiente `GENIUS_ACCESS_TOKEN`. Nunca coloque o token no código do front-end.

## 📍 Status das páginas

| Página | Status |
|---|---|
| Início, Explorar, Álbum, Artista, Música | ✅ Funcionais |
| Charts, Notícias, Perfil | ✅ Funcionais |
| Login e Criar Conta | ✅ Funcionais (simulados no navegador, sem backend) |
| Playlist | 🚧 Em desenvolvimento |

## ⚠️ Observações

- A autenticação é **simulada** (dados no `localStorage`) e serve apenas para fins didáticos — não use senhas reais.
- A chave do TheAudioDB é a de teste pública, com limite de requisições.

## 🤝 Contribuindo

1. Faça um **fork**
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m "Adiciona minha feature"`
4. Push: `git push origin feature/minha-feature`
5. Abra um **Pull Request**

---

# 🇬🇧 English

## 🎵 What is Beebop?

**Beebop** is a **web music catalog** built for music lovers: search albums, artists and tracks, play previews, **rate, comment and save your favorites**, and find people with similar taste.

This project is our **Integrated Project (Projeto Integrador)**, developed in the **Serasa *Transforme-se*** program in partnership with **SENAC-DF**.

## ✨ Highlights

- 🔎 **Explore** — real-time search, filters, sorting and pagination
- 💿 **Albums, Artists & Tracks** — detail pages with real catalog data
- 🏆 **Charts** — album and track rankings
- 📰 **News** — a curated selection from the music world
- ⭐ **Ratings & comments** — leave your score and share your opinion
- 🎧 **Player** — audio previews with playback controls
- 📝 **Lyrics** — Genius and Lyrics.ovh integration
- 👤 **Login, Sign-up & Profile** — user account and saved items
- 📱 **Responsive layout** — works on mobile, tablet and desktop

## 🧰 Tech Stack

| Technology | What we use it for |
|---|---|
| **HTML5** | Page structure |
| **CSS3** | Look & feel, animations and responsiveness |
| **JavaScript (ES Modules)** | Logic, components and navigation — no framework |
| **iTunes Search API** | Music, album and artist catalog, plus previews |
| **TheAudioDB** | Artist photos |
| **Genius API** + **Lyrics.ovh** | Lyrics lookup |
| **Vercel Functions** | Secure proxy to keep the Genius token private |
| **localStorage** | Session, simulated accounts and favorites in the browser |
| **Font Awesome** + **Google Fonts (Inter)** | Icons and typography |

## 🗂️ Structure

```text
Beebop/
├── api/            # Serverless function (Genius proxy)
├── assets/         # Images and branding
├── css/            # style, components and responsive
├── js/
│   ├── components/ # Header, Player, Cards, Pagination...
│   ├── pages/      # Home, Explore, Album, Artist, Track, Charts, News, Profile, Login...
│   ├── services/   # API access and authentication
│   ├── store/      # Shared state (appState)
│   ├── data/       # Curated selections and news
│   └── utils/      # Formatters, validators and helpers
└── index.html      # Redirects to the home page
```

## 🚀 Getting Started

The project uses ES Modules and `fetch`, so it must be served over HTTP (opening `index.html` straight from disk won't work).

```bash
# 1. Clone the repository
git clone https://github.com/your-username/beebop.git
cd beebop

# 2. Start a local server (pick one)
python3 -m http.server 8080
# or
npx serve .
```

Open **http://localhost:8080** 🎉

> 💡 **Lyrics via Genius (optional):** deploy `api/genius-search.js` as a serverless function (e.g. Vercel) and set the `GENIUS_ACCESS_TOKEN` environment variable. Never put the token in front-end code.

## 📍 Page Status

| Page | Status |
|---|---|
| Home, Explore, Album, Artist, Track | ✅ Working |
| Charts, News, Profile | ✅ Working |
| Login & Sign-up | ✅ Working (simulated in the browser, no backend) |
| Playlist | 🚧 In progress |

## ⚠️ Notes

- Authentication is **simulated** (data lives in `localStorage`) and is for learning purposes only — don't use real passwords.
- The TheAudioDB key is the public test key and is rate-limited.

## 🤝 Contributing

1. **Fork** the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a **Pull Request**

---

<div align="center">

Feito com 💛 pela equipe Beebop · Made with 💛 by the Beebop team

</div>
