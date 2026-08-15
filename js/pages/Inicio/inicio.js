// pages/Inicio/inicio.js

import { renderHeader } from '../../components/header.js';

function initInicioPage() {
  const app = document.getElementById('app');

  const header = renderHeader({
    onSearch: (query) => {
      console.log('Buscando por:', query);
      // lógica de busca aqui
    }
  });

  app.appendChild(header);
}

document.addEventListener('DOMContentLoaded', initInicioPage);