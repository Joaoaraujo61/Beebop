import { renderHeader } from './components/header.js'

async function bootstrap() {
    const app = document.getElementById('app')

    //renderiza componentes globais
    const header = renderHeader({})
    app.prepend(header)

    //capta data page da pagina atual, para identificação
    const page = document.body.dataset.page

    switch(page){
        case 'inicio':{
            const { initInicioPage } = await import('./pages/Inicio/inicio.js')
            initInicioPage({header})
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
        default:
            console.warn(`Página "${page}" não reconhecida.`);
    }
}
