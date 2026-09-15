import { renderHeader } from './components/header.js'
import { renderFooter } from './components/footer.js'

async function bootstrap() {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');

    //renderiza componentes globais
    const header = renderHeader({})
    const footer = renderFooter({})
    headerContainer.appendChild(header);
    footerContainer.appendChild(footer);

    //capta data page da pagina atual, para identificação
    const page = document.body.dataset.page

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
