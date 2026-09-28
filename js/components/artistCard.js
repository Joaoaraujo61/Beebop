// js/components/artistCard.js
//
// Card de artista reutilizável — Explorar (aba "Artistas" e descoberta).
// Segue o mesmo padrão de trackCard.js/albumCard.js: função pura de render
// (string) + função separada pra ligar a navegação.
//
// A iTunes Search API não devolve foto de artista, então a imagem vem da
// TheAudioDB (js/services/audioDbApi.js), buscada por nome. O avatar começa
// com as iniciais (mesmo padrão de js/components/comentarios.js) e vira foto
// quando ela carrega. Se não achar, as iniciais permanecem.

import { buscarImagemArtista } from '../services/audioDbApi.js';

/**
 * @param {object} artista - { id, nome, genero }
 * @returns {string} Markup do card.
 */
export function renderArtistCard(artista) {
  return `
    <article class="artist_card" data-id="${artista.id}">
      <div class="artist_avatar" data-nome="${escaparHtml(artista.nome)}">${iniciais(artista.nome)}</div>
      <div class="artist_info">
        <span class="artist_nome">${escaparHtml(artista.nome)}</span>
        <span class="artist_label">${artista.genero ? escaparHtml(artista.genero) : 'Artista'}</span>
      </div>
    </article>`;
}

/**
 * Liga o clique de cada card de artista renderizado dentro de `root` à
 * navegação para pages/Artista/artista.html e carrega as fotos.
 * @param {HTMLElement} root
 * @param {Array} artistas
 */
export function attachArtistCardEvents(root, artistas) {
  root.querySelectorAll('.artist_card').forEach((card) => {
    card.addEventListener('click', () => {
      const artista = artistas.find((item) => String(item.id) === card.dataset.id);
      if (!artista) return;
      const params = new URLSearchParams({ id: String(artista.id), nome: artista.nome });
      window.location.href = `../Artista/artista.html?${params.toString()}`;
    });
  });

  hydrateArtistImages(root);
}

/**
 * Carrega a foto de cada avatar só quando o card aparece na tela
 * (evita disparar uma requisição por card de uma lista longa).
 * @param {HTMLElement} root
 */
export function hydrateArtistImages(root) {
  const avatares = root.querySelectorAll('.artist_avatar[data-nome]');

  if (!('IntersectionObserver' in window)) {
    avatares.forEach(carregarFoto);
    return;
  }

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        observer.unobserve(entrada.target);
        carregarFoto(entrada.target);
      });
    },
    { rootMargin: '200px' }
  );

  avatares.forEach((avatar) => observer.observe(avatar));
}

async function carregarFoto(avatar) {
  const url = await buscarImagemArtista(avatar.dataset.nome);
  if (!url) return; // mantém as iniciais

  const img = new Image();
  img.alt = '';
  img.onload = () => {
    avatar.textContent = '';
    avatar.appendChild(img);
  };
  img.src = url;
}

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2);
  return letras.toUpperCase();
}

function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}