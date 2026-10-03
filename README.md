# 🎵 Beebop - Catálogo Web de Músicas / Web Music Catalog

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento%20%2F%20In%20Development-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## 🌐 Idiomas / Languages

- [Português (BR)](#-português-br)
- [English](#-english)

---

## 🇧🇷 Português (BR)

### 📌 Sobre o Projeto

O **Beebop** é uma plataforma/catálogo web de música desenvolvida como **Projeto Integrador**. A aplicação foi projetada para conectar entusiastas de música a um acervo interativo, permitindo explorar novos artistas, álbuns, playlists e faixas com uma experiência visual moderna e responsiva.

---

### ✨ Funcionalidades Principais

- 🔍 **Busca & Descobrimento:** Pesquisa dinâmica por músicas, artistas, gêneros e álbuns.
- 🎨 **Interface Interativa:** Layout dinâmico com modo escuro/claro e navegação fluida.
- 🎧 **Player / Prévia de Áudio:** Execução de amostras de áudio e controle de reprodução.
- ❤️ **Favoritos e Playlists:** Permite salvar músicas preferidas e criar listas personalizadas.
- 👤 **Autenticação de Usuário:** Sistema de login/cadastro para personalização da experiência.
- 📱 **Design Responsivo:** Adaptável a dispositivos móveis, tablets e desktops.

---

### 🚀 Tecnologias e Ferramentas

#### **Front-end**
- **React.js** (com Hooks e Context API)
- **HTML5 & CSS3** / **Tailwind CSS** ou **Styled Components**
- **Axios** (para consumo de APIs)
- **Lucide / FontAwesome** (Ícones)

#### **Back-end (se aplicável)**
- **Node.js** & **Express**
- **JWT (JSON Web Token)** para autenticação
- **Prisma / Sequelize** (ORM)

#### **Banco de Dados & Outros**
- **PostgreSQL** / **MongoDB**
- **Git & GitHub** (Controle de versão)

---

### 📂 Estrutura de Pastas

```text
beebop/
├── public/              # Arquivos estáticos (favicon, imagens, index.html)
├── src/
│   ├── assets/          # Estilos globais, imagens e mídias
│   ├── components/      # Componentes reutilizáveis (Header, Player, Card, etc.)
│   ├── context/         # Contextos da aplicação (Autenticação, Player)
│   ├── pages/           # Páginas principais (Home, Search, Library, Profile)
│   ├── services/        # Configuração de rotas de API (Axios/Fetch)
│   ├── utils/           # Funções utilitárias e helpers
│   ├── App.jsx          # Componente raiz
│   └── main.jsx         # Ponto de entrada da aplicação
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json         # Dependências do projeto
└── README.md            # Documentação
```

---

### 🛠️ Pré-requisitos e Instalação

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)
- Gerenciador de pacotes `npm` ou `yarn`

#### **Passo a passo:**

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/beebop.git
   cd beebop
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_MUSIC_API_KEY=sua_chave_aqui
   ```

4. **Executar a aplicação:**
   ```bash
   npm run dev
   # ou
   npm start
   ```
   Acesse no navegador: `http://localhost:5173` (ou a porta informada no terminal).

---

<br/>

---

## 🇬🇧 English

### 📌 About the Project

**Beebop** is a web music catalog platform developed as an **Integrated Project**. The application was designed to connect music enthusiasts with an interactive library, allowing users to explore new artists, albums, playlists, and tracks through a modern, responsive user experience.

---

### ✨ Key Features

- 🔍 **Search & Discovery:** Dynamic search for tracks, artists, genres, and albums.
- 🎨 **Interactive UI:** Dynamic layout with dark/light mode and seamless navigation.
- 🎧 **Audio Player / Preview:** Play audio samples with full playback controls.
- ❤️️ **Favorites & Playlists:** Save favorite songs and create custom playlists.
- 👤 **User Authentication:** Login and signup system for personalized user experience.
- 📱 **Responsive Design:** Fully optimized for mobile, tablet, and desktop devices.

---

### 🚀 Tech Stack

#### **Front-end**
- **React.js** (Hooks & Context API)
- **HTML5 & CSS3** / **Tailwind CSS** or **Styled Components**
- **Axios** (API requests)
- **Lucide / FontAwesome** (Icon sets)

#### **Back-end (if applicable)**
- **Node.js** & **Express**
- **JWT (JSON Web Token)** for authentication
- **Prisma / Sequelize** (ORM)

#### **Database & Tools**
- **PostgreSQL** / **MongoDB**
- **Git & GitHub** (Version Control)

---

### 🛠️ Prerequisites and Installation

Make sure you have installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- `npm` or `yarn` package manager

#### **Step by Step:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/beebop.git
   cd beebop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory using `.env.example` as a template:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_MUSIC_API_KEY=your_key_here
   ```

4. **Run the project:**
   ```bash
   npm run dev
   # or
   npm start
   ```
   Open your browser at: `http://localhost:5173`

---

## 🤝 Contribuição / Contributing

Contribuições são super bem-vindas! Se deseja melhorar o projeto:
1. Faça um **Fork** do projeto.
2. Crie uma nova branch com a sua feature (`git checkout -b feature/MinhaFeature`).
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`).
4. Envie para o branch (`git push origin feature/MinhaFeature`).
5. Abra um **Pull Request**.

---

## 📄 Licença / License

Este projeto está sob a licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.

---

<p align="center">
  <i>Desenvolvido com 💜 pela equipe do <b>Projeto Integrador Beebop</b>.</i>
</p>
