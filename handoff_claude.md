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
