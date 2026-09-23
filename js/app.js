import { renderHeader } from './components/header.js'
import { renderFooter } from './components/footer.js'
import { appState } from './store/appState.js'

/**
 * Páginas que exigem login. Se não houver usuário na sessão (appState.user),
 * o visitante é redirecionado para o Login antes de a página renderizar.
 *
 * TODO: adicionar 'salvos' aqui assim que essa rota existir neste switch
 * (hoje o projeto ainda não tem um case 'salvos' — ver pages/Salvos).
 * Reviews não entram aqui: são uma seção dentro da página de Álbum
 * (pública), então o bloqueio delas deve acontecer dentro do próprio
 * componente de reviews, não como redirecionamento de rota inteira.
 */
const PROTECTED_PAGES = ['perfil'];

async function bootstrap() {
    const page = document.body.dataset.page

    // Bloqueia páginas que exigem login antes de renderizar qualquer coisa.
    if (PROTECTED_PAGES.includes(page) && !appState.getState().user) {
        window.location.href = '../Login/login.html';
        return;
    }

    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');

    //renderiza componentes globais
    const header = renderHeader({})
    const footer = renderFooter({})
    headerContainer.appendChild(header);
    footerContainer.appendChild(footer);

    switch(page){
        case 'inicio':{
            const { initInicioPage } = await import('./pages/Inicio/inicio.js')
            initInicioPage({header})
            break
        }
        case 'explorar':{
            const { initExplorarPage } = await import('./pages/Explorar/explorar.js')
            initExplorarPage({header})
            break
        }
        case 'charts':{
            const { initChartsPage } = await import('./pages/Charts/charts.js')
            initChartsPage({header})
            break
        }
        case 'noticias':{
            const { initNoticiasPage } = await import('./pages/Noticias/noticias.js')
            initNoticiasPage({header})
            break
        }
        case 'album': {
            const { initAlbumPage } = await import('./pages/Album/album.js');
            initAlbumPage({ header });
            break;
        }
        case 'artista': {
            const { initArtistaPage } = await import('./pages/Artista/artista.js');
            initArtistaPage({ header });
            break;
        }
        case 'perfil': {
            const { initPerfilPage } = await import('./pages/Perfil/perfil.js');
            initPerfilPage({ header });
            break;
        }
        case 'login': {
            const { initLoginPage } = await import('./pages/Login/login.js');
            initLoginPage({ header });
            break;
        }
        case 'criar_conta': {
            const { initCadastroPage } = await import('./pages/CriarConta/criar_conta.js');
            initCadastroPage({ header });
            break;
        }
        case 'playlist': {
            const { initPlaylistPage } = await import('./pages/Playlist/playlist.js');
            initPlaylistPage({ header });
            break;
        }
        case 'musica': {
            const { initMusicaPage } = await import('./pages/Musica/musica.js');
            initMusicaPage({ header });
            break;
        }
        default:
            console.warn(`Página "${page}" não reconhecida.`);
    }
    
}

document.addEventListener('DOMContentLoaded', bootstrap)