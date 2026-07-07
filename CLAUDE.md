# Projeto — Apresentação SCIN (Epistemologia da Construção, Koskela 2017)

Apresentação HTML feita com o motor **FabSlides** (Projetor / Console do
Apresentador / Controle Remoto / Servidor WebSocket). Entregável final é HTML,
**não** PPTX/PDF. Detalhes de conteúdo e arquitetura: `implementation_plan.md`,
`FabSlides/FABSLIDES.md`, `handoff_claude.md`.

## Design — LEIA SEMPRE ANTES DE MEXER EM UI

**`DESIGN.md` (na raiz) é a fonte da verdade visual.** Antes de gerar ou editar
qualquer estilo, cor, tipografia ou componente, consulte-o e use os **tokens
semânticos** (`--color-primary`, `--color-accent`, etc.) definidos em
`apresentacao/tokens.css`, que é gerado a partir do `DESIGN.md`.

Regras não-negociáveis:
- **Azul** = estrutura/disciplina. **Vermelho** (`--color-accent`) = tensão, e
  só em contexto de patologia / problema oculto / crítica.
- Nunca hardcode hex de marca — mude o valor no `DESIGN.md` e rode o build de tokens.
- Nada de paleta antiga de vinícola (creme, verde-moscatel, laranja) nem de
  Playfair/Outfit. Títulos = Sora, corpo = Inter.
- `apresentacao/tokens.css` e `apresentacao/tokens.json` são gerados por
  `tools/design-tokens/build.mjs`. Para mudar tokens, edite `DESIGN.md` e rode
  `npm run build` dentro de `tools/design-tokens`. Nunca edite `tokens.css` à mão.

## Arquivos que se sincronizam

Ao mudar conteúdo textual de um slide, manter os três em sincronia:
`apresentacao/index.html` (Projetor) · `apresentacao/apresentador/index.html`
(array `SLIDES_DATA`) · `apresentacao/remoto/index.html` (array `SLIDES`).

Não modificar `apresentacao/main.js`, `server/` sem necessidade clara.
