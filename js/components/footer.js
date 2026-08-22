

export function renderFooter(){
  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = `
      <div class="footer_beebop">
        <a href="/index.html"><img src="../../../assets/beebop.png"></a>
        <p>Seu espaço para descobrir e catalogar música.</p>
        <p>Explore artistas, álbuns e músicas, organize seus favoritos e descubra novos sons além das tendências.</p>
        <p>Feito para quem vive música.</p>
      </div>  
      <table class="footer_links">
        <tr>
          <th>Plataforma</th>
          <th>Beebop</th>
        </tr>
        <tr>
          <td>Explorar</td>
          <td>Sobre</td>
        </tr>
        <tr>
          <td>Charts</td>
          <td>Contato</td>
        </tr>
        <tr>
          <td>Categorias</td>
          <td>Privacidade</td>
        </tr>
        <tr>
          <td>Notícias</td>
          <td>Termos</td>
        </tr>      
      </table>
      <div class="footer_copyright">
        <p>&copy;2026 Todos os Direitos Reservados</p>
      </div>`;

  return footer;
}