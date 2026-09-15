# Beebop

Aplicação web criada para amantes da música, nele você pode avaliar, comentar, salvar seus álbuns e músicas preferidas além de encontrar pessoas com gostos musicais semelhantes. Aplicação criada como projeto final do programa Serasa Transforme-se em parceria com o SENAC-DF.

## Sobre esta versão

Esta é a **versão consolidada** do projeto, resultado da fusão de duas branches de desenvolvimento (`Beebop-dev` e `Beebop-versao-al`) que evoluíram em paralelo cobrindo partes diferentes e complementares do produto. Veja `RELATORIO_CONSOLIDACAO.md` para o detalhamento completo de cada decisão tomada, bugs corrigidos e pontos ainda pendentes.

## Como rodar

Como o projeto usa ES Modules (`import`/`export`) e `fetch`, ele precisa ser servido por um servidor HTTP local (abrir `index.html` direto do disco, via `file://`, não funciona). Exemplos:

```bash
# Python
python3 -m http.server 8080

# Node (com o pacote "serve")
npx serve .
```

Depois acesse `http://localhost:8080`.

## Páginas funcionais

| Rota | Status |
|---|---|
| Início | ✅ Funcional (landing animada) |
| Explorar | ✅ Funcional (busca real via iTunes API, filtros, ordenação, paginação) |
| Álbum | ✅ Funcional (aceita `?id=<collectionId da iTunes>`; sem `id`, mostra álbum de demonstração) |
| Login | ✅ Funcional (validação client-side; sem backend real) |
| Criar Conta | ✅ Funcional (validação client-side; sem backend real) |
| Artista | 🚧 Placeholder — não implementada em nenhuma das branches originais |
| Perfil | 🚧 Placeholder — CSS e helpers já existem, falta a implementação |
| Charts | 🚧 Placeholder — não implementada em nenhuma das branches originais |
| Playlist | 🚧 Placeholder — não implementada em nenhuma das branches originais |
| Música | 🚧 Placeholder — não implementada em nenhuma das branches originais |
