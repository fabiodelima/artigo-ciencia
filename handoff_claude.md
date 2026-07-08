# Handoff: Refatoração de Tokens, Componentes e Limpeza de Código-Morto

Este documento serve como guia de transição para o estado atual da apresentação sobre **"On Epistemology of Construction Engineering and Management" (Koskela et al., 2017)** após a refatoração e limpeza crítica de design.

---

## 1. O que foi realizado

### Eliminação de Código-Morto e Sobras da Vinícola
Identificamos que o arquivo `style.css` original (~2700 linhas) e o `main.js` continham dezenas de seletores e lógicas associadas a uma apresentação anterior de vinícola (tabelas e cards Moscatel, autoclave de fermentação, parallax de mapa de Bento Gonçalves, VSM, etc.). Todo esse resíduo foi removido.
- **Redução do CSS:** `style.css` caiu de **73KB** para **10KB**, tornando o carregamento e a depuração instantâneos.

### Refatoração de Classes e Unificação de Componentes
Substituímos classes proprietárias e confusas (como prefixos `.agro-` em um tema de engenharia civil) e duplicidades por um sistema robusto e semântico de componentes:
1. **Grids utilitários:** `.grid` com modificadores `.grid--2-col`, `.grid--3-col`, `.grid--6-col` em substituição a contêineres customizados redundantes.
2. **Cards unificados:** `.card` como classe base reutilizável, configurada com:
   - Modificadores de contexto: `.card--structure` (azul de estrutura) e `.card--tension` (vermelho de tensão, restrito a patologias/problemas).
   - Modificadores de layout/slide: `.card--split` (metades de tela nos Slides 4 e 5), `.card--roadmap` (Slide 2) e `.card--dark` (Slide 10).
   - Elementos internos padronizados: `.card-badge`, `.card-title`, `.card-text`, `.card-stat` e `.card-number`.
3. **Callouts semânticos:** `.callout` (antigo `.answer-box` de respostas do artigo) e `.callout--root` (antigo `.ice-root` do iceberg).

---

## 2. Estrutura de Arquivos e Status Atual

- [index.html](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/apresentacao/index.html) (Projetor): Atualizado com a nova marcação HTML estruturada em `.card`, `.grid` e `.callout`. A tag interna `<style id="slide-04-styles">` foi limpa e ajustada.
- [style.css](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/apresentacao/style.css) (Estilo Geral): Totalmente limpo. Contém apenas resets, layouts estruturais de slide, indicador de progresso e as definições universais de `.card`, `.grid` e `.callout`.
- [slides-extra.css](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/apresentacao/slides-extra.css) (Estilos de Suporte): Ajustado para usar as novas classes genéricas (iceberg, timeline de pistas e balança).
- [main.js](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/apresentacao/main.js) (Lógica de Navegação): Simplificado. Remoção do parallax do mapa de Bento Gonçalves, das animações da vinícola e das complexidades de impressão do carrossel do Slide 5.
- [DESIGN.md](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/DESIGN.md) (Verdade Visual): **Não modificado** (preservação total do arquivo e dos tokens definidos).

### Backup de Segurança
Uma cópia completa da pasta anterior (contendo as classes `.agro-` e os estilos legados) foi salva em [backup_apresentacao/](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/backup_apresentacao).

---

## 3. Próximos Passos (Pronto para Validação)

Para quem for testar ou continuar o trabalho de design e ensaio da apresentação:

1. **Validação de Comportamento:**
   - Abra o `apresentacao/index.html` e verifique a rolagem e os passos progressivos (`ArrowRight` / `Space`).
   - Confirme se os cards, grids e callouts estão alinhados e se as cores azul (`--color-primary`) e vermelha (`--color-accent`) estão sendo aplicadas nos locais corretos (vermelho apenas nos slides de patologia/tensão: Slides 3, 7, 8 e 10).
2. **Validação de Impressão:**
   - Pressione a tecla `P` no teclado (ou `Ctrl+P`) na aba da apresentação para disparar a visualização de impressão e garanta que os slides se adaptem e diagramem corretamente na folha 1920x1080 horizontal sem quebras de página desalinhadas.
3. **Sincronização:**
   - Se houver qualquer ajuste nos textos de slides em `index.html`, lembre-se de replicar as alterações no array `SLIDES_DATA` em [apresentador/index.html](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/apresentacao/apresentador/index.html) e no array `SLIDES` em [remoto/index.html](file:///c:/Users/fabio/OneDrive/Documentos/SCIN_2026-07-09_Apresentação/apresentacao/remoto/index.html).

---

## 4. Handoff de Deploy Web (GitHub + Coolify) - 2026-07-07

### Estado atual
- Repositorio publicado em `https://github.com/fabiodelima/artigo-ciencia`.
- App no Coolify: `artigo-ciencia`.
- UUID do app no Coolify: `ktp7qev3j0sgx3tol83cbe7x`.
- Branch em deploy: `master`.
- Ultimo commit publicado durante esta sessao: `0e1b390` (`Respect forwarded URI for routed pages`).
- Health no Coolify ficou `running:healthy` apos o ultimo redeploy.

### URLs finais esperadas
- `https://fabiollima.com/artigo-ciencia/` -> apresentacao principal (`apresentacao/index.html`)
- `https://fabiollima.com/artigo-ciencia/remoto` -> controle remoto (`apresentacao/remoto/index.html`)
- `https://fabiollima.com/artigo-ciencia/apresentador` -> painel do apresentador (`apresentacao/apresentador/index.html`)

### O que deu errado no meio do caminho
- Inicialmente foram configuradas rotas separadas no Coolify para:
  - `/artigo-ciencia`
  - `/artigo-ciencia/remoto`
  - `/artigo-ciencia/apresentador`
- Isso fez o proxy stripar os prefixes de forma independente antes de entregar a requisicao ao Node.
- Sintoma observado: `.../apresentador` carregava a pagina principal e acabava com hash como `#slide-01`, sinal de que `main.js` do projetor estava rodando no lugar da pagina do apresentador.

### Correcao aplicada
- O Coolify ficou com apenas uma rota base:
  - `https://fabiollima.com/artigo-ciencia`
- O servidor Node em `apresentacao/server/index.js` foi adaptado para:
  - servir os arquivos estaticos da apresentacao, remoto e apresentador no mesmo container;
  - entender o prefixo base `/artigo-ciencia`;
  - usar `x-forwarded-uri` / `x-original-uri` para decidir corretamente entre `/`, `/remoto` e `/apresentador` quando ha proxy no caminho.

### Verificacao feita na sessao
- Foi feita verificacao HTTP externa com `Invoke-WebRequest` contra as 3 rotas publicas.
- Os titulos retornados foram:
  - principal: `On Epistemology of Construction Engineering and Management ...`
  - remoto: `Controle Remoto - Epistemologia da Construcao`
  - apresentador: `Painel do Apresentador - Epistemologia da Construcao (Koskela 2017)`
- Isso confirmou que as 3 rotas estavam respondendo com HTMLs diferentes no fim da sessao.

### Arquivos relevantes para continuar
- `Dockerfile` na raiz: container unico para servir WS + HTML.
- `apresentacao/server/index.js`: roteamento HTTP + WebSocket + logica de prefixo/proxy.
- `apresentacao/main.js`: projetor calcula WebSocket pelo host atual.
- `apresentacao/remoto/index.html`: remoto calcula WebSocket pelo host atual.
- `apresentacao/apresentador/index.html`: apresentador calcula WebSocket pelo host atual.

### Observacoes praticas para a proxima sessao
- Se voltar a haver comportamento estranho nas rotas, conferir primeiro a configuracao de dominios do app no Coolify; ela deve permanecer apenas com a rota base `/artigo-ciencia`.
- Se o HTML estiver certo mas o navegador parecer insistir no comportamento antigo, suspeitar de cache do browser ou do proxy antes de mexer no Node novamente.
- O workspace local ainda esta em uma situacao Git meio hibrida por causa do OneDrive:
  - existe `.git` atual no workspace;
  - existe tambem `.git.broken-2026-07-07` como sobra da tentativa anterior;
  - o publish para GitHub foi feito a partir de uma copia temporaria em `C:\Users\fabio\AppData\Local\Temp\artigo-ciencia-github`.
- Se for continuar publicando da proxima vez, vale decidir se o repo local sera saneado de vez ou se a estrategia continua sendo publicar via copia temporaria.

---

## 5. Handoff de Continuação — Ajustes de Conteúdo/Design (2026-07-08)

### Alterações aplicadas
- Projetor (`apresentacao/index.html`):
  - Slide 02 refeito como roadmap por perguntas, sem marcador visual extra em "explícitas"; nota maior, centralizada e com títulos dos cards mais explicativos.
  - Slide 03 sem chip "Pergunta do artigo".
  - Slides 04 e 05 ajustados para hierarquia split: categoria/pergunta em nível meta e badges/títulos alinhados entre os dois lados.
  - Slide 09 reorganizado em duas faixas horizontais: balança em cima e educação/reforma embaixo; cards da balança com mais contraste e sombra.
- Estilos (`apresentacao/style.css`, `apresentacao/slides-extra.css`):
  - Cabeçalho com hierarquia mais consistente: categoria estrutural em azul, vermelho restrito a slides de tensão/crítica.
  - Componentes novos/ajustados usando tokens do `DESIGN.md`.
- Painel do Apresentador (`apresentacao/apresentador/index.html`):
  - Dados `SLIDES_DATA` sincronizados com novos títulos e roteiro.
  - "Timeline de Revelação & Speech" removida do modo estudo.
  - "Destrinchando o Slide" substituído por "Teoria do Slide", com HTML mais rico: fatos, teoria, listas e leitura crítica.
  - Modo estudo transformado em split ajustável: prévia/teoria à esquerda e localizador + PDF embutido à direita.
  - PDF embutido abre direto na página indicada pelo slide; drawer em tela cheia preservado como ação auxiliar.
  - Removido uso visível de "Console do Apresentador"; o botão de grid agora volta como "Modo Painel".
- Controle remoto (`apresentacao/remoto/index.html`):
  - Títulos e falas sincronizados com painel/projetor, incluindo correção do slide 07 para "Quando o platonismo excessivo adoece o projeto".

### Validações feitas
- `node --check apresentacao/main.js`
- `node --check apresentacao/server/index.js`
- Check estático com Node confirmou 10 seções no projetor e títulos/document titles esperados.
- `rg` confirmou ausência de: `Console do Apresentador`, `Timeline de Revelação`, `Pergunta do artigo`, `🟢`, `Modo Console` em arquivos manuais da apresentação.
- A validação visual por Chrome DevTools ficou bloqueada porque o Chrome da ferramenta não acessou o `localhost` do PowerShell. O `Invoke-WebRequest` local respondeu 200 durante teste com servidor temporário, mas o processo não permaneceu estável nessa sessão.

### Próximo passo operacional
- Publicação concluída usando a estratégia registrada no handoff anterior: cópia para `C:\Users\fabio\AppData\Local\Temp\artigo-ciencia-github`, commit e push para `master`.
- Commit publicado: `470e40a` (`Refine seminar slides and presenter panel`).
- Deploy Coolify forçado e finalizado: `eipgugy6cmuanci1de6ymle3`, commit `470e40abcef3e0b75ceae2a96733cb8aca4e9b8f`, status `finished`.
- Rotas públicas validadas com HTTP 200:
  - `https://fabiollima.com/artigo-ciencia/`
  - `https://fabiollima.com/artigo-ciencia/apresentador`
  - `https://fabiollima.com/artigo-ciencia/remoto`
