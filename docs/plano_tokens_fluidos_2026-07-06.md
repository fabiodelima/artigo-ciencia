# Design System — Tokens não-cromáticos, escala fluida e painel de tweaks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao design system da apresentação a segunda metade que falta — tokens de tipografia/espaço/raio em escala fluida (`clamp()`), organizados numa taxonomia de 3 camadas (DTCG), gerados a partir do `DESIGN.md`, com um painel de tweaks dev-only para tunar em tempo real.

**Architecture:** `DESIGN.md` (frontmatter YAML) é a **fonte única da verdade**. Um script Node (`tools/design-tokens/build.mjs`) lê o frontmatter, calcula os `clamp()` (método Utopia) e emite `apresentacao/tokens.css` (consumido pela apresentação) + `apresentacao/tokens.json` (formato DTCG, interoperável). O CSS existente é refatorado para consumir os tokens semânticos em vez de ~48 valores avulsos. Um overlay Tweakpane carregado só com `?dev` faz live-bind nas CSS custom properties e exporta valores de volta pro DESIGN.md — direção única da verdade, sem duas fontes brigando.

**Tech Stack:** HTML/CSS/JS (motor FabSlides), Node ≥18 (ESM), `js-yaml` (parse do frontmatter), Tweakpane 4 (painel dev, via CDN), Chrome DevTools MCP (verificação visual responsiva).

## Global Constraints

- Formato de entrega é HTML/FabSlides — **nunca** PPTX/PDF.
- `DESIGN.md` é a fonte da verdade; `tokens.css`/`tokens.json` são **gerados** (não editar à mão).
- Vermelho (`--color-accent`) só em contexto de patologia/problema oculto/crítica.
- Sem hardcode de tamanho: todo `font-size`/`padding`/`gap`/`border-radius` referencia token semântico.
- Regra WCAG de zoom: em cada degrau, `max ≤ 2.5 × min` (garante SC 1.4.4).
- Manter Projetor/Console/Remoto sincronizados quando aplicável.
- Não modificar `apresentacao/main.js`, `apresentacao/server/` sem necessidade clara.
- Fluxo de verdade: `DESIGN.md → build.mjs → tokens.css/json → apresentação`; painel `?dev` só experimenta e exporta de volta pro DESIGN.md.

## Fluxo (direção única da verdade)

```
DESIGN.md  ──(build.mjs)──►  tokens.json + tokens.css  ──►  apresentação
    ▲                                                            │
    └──────── colar valores exportados ◄──── painel ?dev (tunar ao vivo)
```

## Taxonomia de tokens (3 camadas — DTCG)

| Camada | Papel | Exemplos |
|---|---|---|
| **Primitivo** | valor cru, sem semântica | `--step-3`, `--space-m`, `--radius-card`, `--blue-500` |
| **Semântico** | intenção → aponta pro primitivo | `--font-size-title`, `--space-card-gap`, `--color-accent` |
| **Componente** | específico → aponta pro semântico | `--hero-title-size`, `--card-pathology-pad` |

Regra: componente **nunca** referencia primitivo direto — sempre via semântico.

## Escala fluida (fonte: método Utopia)

Viewport de interpolação: **375px → 1600px**. Tipografia (min@375 → max@1600, px):

| Degrau | min | max | Papel semântico |
|---|---|---|---|
| `--step--2` | 12 | 14 | caption / legenda |
| `--step--1` | 14 | 16 | small / rótulo |
| `--step-0` | 16 | 20 | body |
| `--step-1` | 19 | 25 | body-lg / lead |
| `--step-2` | 23 | 31 | subtitle |
| `--step-3` | 28 | 39 | title |
| `--step-4` | 33 | 49 | heading-lg |
| `--step-5` | 40 | 61 | display |
| `--step-6` | 48 | 76 | hero |

Espaço (min@375 → max@1600, px): `3xs` 4→5 · `2xs` 8→10 · `xs` 12→15 · `s` 16→20 · `m` 24→30 · `l` 32→40 · `xl` 48→60 · `2xl` 64→80 · `3xl` 96→120.

Todos passam a regra `max ≤ 2.5 × min`.

## File Structure

- Create: `tools/design-tokens/build.mjs` — gerador DESIGN.md → CSS/JSON.
- Create: `tools/design-tokens/package.json` — dep `js-yaml`, script `build`.
- Create: `apresentacao/tokens.css` — **gerado**; `:root` com primitivos + semânticos + cores.
- Create: `apresentacao/tokens.json` — **gerado**; formato DTCG.
- Create: `apresentacao/dev-panel.js` — overlay Tweakpane (`?dev`).
- Modify: `DESIGN.md` — frontmatter ganha `scale`/`primitives`/`semantic`; corpo ganha seções de escala.
- Modify: `apresentacao/index.html`, `apresentacao/apresentador/index.html`, `apresentacao/remoto/index.html` — link do `tokens.css` antes do `style.css`; script do painel condicional.
- Modify: `apresentacao/style.css` — `:root` cromático migra pro `tokens.css`; `font-size`/espaços viram tokens.
- Modify: `apresentacao/slides-extra.css` — idem.
- Modify: `CLAUDE.md` — regra "tokens.css é gerado; edite DESIGN.md".

---

### Task 1: Estender o `DESIGN.md` com a escala e a taxonomia (fonte da verdade)

**Files:**
- Modify: `DESIGN.md` (frontmatter + corpo)

**Interfaces:**
- Produces: frontmatter YAML com chaves `scale.viewport`, `scale.type`, `scale.space`, `radius`, `primitives.color`, `semantic` — consumido por `build.mjs` (Task 2).

- [ ] **Step 1: Adicionar bloco `scale` ao frontmatter YAML do `DESIGN.md`**

Inserir dentro do frontmatter (antes do fechamento `---`):

```yaml
scale:
  viewport: { min: 375, max: 1600 }
  type:
    "-2": { min: 12, max: 14, role: caption }
    "-1": { min: 14, max: 16, role: small }
    "0":  { min: 16, max: 20, role: body }
    "1":  { min: 19, max: 25, role: body-lg }
    "2":  { min: 23, max: 31, role: subtitle }
    "3":  { min: 28, max: 39, role: title }
    "4":  { min: 33, max: 49, role: heading }
    "5":  { min: 40, max: 61, role: display }
    "6":  { min: 48, max: 76, role: hero }
  space:
    "3xs": { min: 4,  max: 5 }
    "2xs": { min: 8,  max: 10 }
    "xs":  { min: 12, max: 15 }
    "s":   { min: 16, max: 20 }
    "m":   { min: 24, max: 30 }
    "l":   { min: 32, max: 40 }
    "xl":  { min: 48, max: 60 }
    "2xl": { min: 64, max: 80 }
    "3xl": { min: 96, max: 120 }
radius:
  control: "8px"
  card: "12px"
  pill: "999px"
```

- [ ] **Step 2: Mapear os degraus para nomes semânticos no frontmatter**

Adicionar bloco `semantic` (aliases DTCG, sintaxe `{caminho}`):

```yaml
semantic:
  font-size-caption:  "{type.-2}"
  font-size-small:    "{type.-1}"
  font-size-body:     "{type.0}"
  font-size-body-lg:  "{type.1}"
  font-size-subtitle: "{type.2}"
  font-size-title:    "{type.3}"
  font-size-heading:  "{type.4}"
  font-size-display:  "{type.5}"
  font-size-hero:     "{type.6}"
  line-height-tight:  "1.15"
  line-height-snug:   "1.3"
  line-height-normal: "1.6"
  weight-regular:     "400"
  weight-medium:      "500"
  weight-bold:        "700"
```

- [ ] **Step 3: Adicionar seção "Tipografia & escala" no corpo do `DESIGN.md`**

Documentar a taxonomia de 3 camadas, a tabela de degraus (copiar do plano), a regra `max ≤ 2.5×min` e o do/don't "nunca `font-size` cru — use `var(--font-size-*)`".

- [ ] **Step 4: Verificar YAML válido**

Run: `node -e "console.log(require('js-yaml').load(require('fs').readFileSync('DESIGN.md','utf8').split('---')[1]) ? 'YAML OK' : 'FAIL')"` (após `js-yaml` instalado na Task 2; se rodar antes, pular e validar no Step final da Task 2).
Expected: `YAML OK`

- [ ] **Step 5: Commit**

```bash
git add DESIGN.md
git commit -m "design: adiciona escala fluida e taxonomia ao DESIGN.md"
```
(Se o projeto ainda não é repositório git, pular commits ou rodar `git init` uma vez — decisão do usuário.)

---

### Task 2: Gerador `build.mjs` (DESIGN.md → tokens.css + tokens.json)

**Files:**
- Create: `tools/design-tokens/package.json`
- Create: `tools/design-tokens/build.mjs`
- Create (gerados): `apresentacao/tokens.css`, `apresentacao/tokens.json`

**Interfaces:**
- Consumes: frontmatter do `DESIGN.md` (Task 1).
- Produces: `apresentacao/tokens.css` com `:root { --step-*, --space-*, --radius-*, --font-size-*, --color-* }`; `apresentacao/tokens.json` (DTCG). Função-chave `fluidClamp(minPx, maxPx, vwMin, vwMax) → string`.

- [ ] **Step 1: Criar `tools/design-tokens/package.json`**

```json
{
  "name": "scin-design-tokens",
  "private": true,
  "type": "module",
  "scripts": { "build": "node build.mjs" },
  "dependencies": { "js-yaml": "^4.1.0" }
}
```

- [ ] **Step 2: Instalar dependência**

Run: `cd tools/design-tokens && npm install`
Expected: cria `node_modules/js-yaml`, sem erros.

- [ ] **Step 3: Escrever `build.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const DESIGN_PATH = path.join(ROOT, 'DESIGN.md');
const OUT_CSS = path.join(ROOT, 'apresentacao', 'tokens.css');
const OUT_JSON = path.join(ROOT, 'apresentacao', 'tokens.json');

const raw = fs.readFileSync(DESIGN_PATH, 'utf8');
const m = raw.match(/^---\n([\s\S]*?)\n---/);
if (!m) throw new Error('DESIGN.md: frontmatter YAML não encontrado');
const fm = yaml.load(m[1]);

const round = (n) => Math.round(n * 10000) / 10000;

function fluidClamp(minPx, maxPx, vwMin, vwMax) {
  const slope = (maxPx - minPx) / (vwMax - vwMin);
  const prefVw = round(slope * 100);
  const interceptRem = round((minPx - slope * vwMin) / 16);
  const minRem = round(minPx / 16);
  const maxRem = round(maxPx / 16);
  return `clamp(${minRem}rem, ${interceptRem}rem + ${prefVw}vw, ${maxRem}rem)`;
}

function assertWcag(name, minPx, maxPx) {
  if (maxPx > 2.5 * minPx) {
    throw new Error(`WCAG SC 1.4.4: ${name} max ${maxPx} > 2.5*min ${minPx}`);
  }
}

const vw = fm.scale.viewport;
const lines = [':root {'];
const jsonTokens = { $type: 'dimension', type: {}, space: {}, color: {}, radius: {} };

lines.push('  /* Primitivos — tipografia (degraus fluidos) */');
for (const [k, v] of Object.entries(fm.scale.type)) {
  assertWcag(`type ${k}`, v.min, v.max);
  const val = fluidClamp(v.min, v.max, vw.min, vw.max);
  lines.push(`  --step-${k}: ${val};`);
  jsonTokens.type[k] = { $value: val, $description: v.role };
}

lines.push('  /* Primitivos — espaço (fluido) */');
for (const [k, v] of Object.entries(fm.scale.space)) {
  const val = fluidClamp(v.min, v.max, vw.min, vw.max);
  lines.push(`  --space-${k}: ${val};`);
  jsonTokens.space[k] = { $value: val };
}

lines.push('  /* Primitivos — raio */');
for (const [k, v] of Object.entries(fm.radius)) {
  lines.push(`  --radius-${k}: ${v};`);
  jsonTokens.radius[k] = { $value: v };
}

lines.push('  /* Semânticos */');
const resolve = (ref) => {
  const mm = String(ref).match(/^\{type\.(-?\d+)\}$/);
  return mm ? `var(--step-${mm[1]})` : `${ref}`;
};
for (const [k, v] of Object.entries(fm.semantic || {})) {
  lines.push(`  --${k}: ${resolve(v)};`);
}

lines.push('  /* Cores (de tokens.color no frontmatter) */');
for (const [k, v] of Object.entries(fm.tokens.color)) {
  lines.push(`  --color-${k}: ${v};`);
  jsonTokens.color[k] = { $type: 'color', $value: v };
}

lines.push('  /* Tipografia — famílias */');
lines.push(`  --font-display: ${fm.tokens.font.display};`);
lines.push(`  --font-body: ${fm.tokens.font.body};`);
lines.push('}');

fs.writeFileSync(OUT_CSS, lines.join('\n') + '\n');
fs.writeFileSync(OUT_JSON, JSON.stringify(jsonTokens, null, 2) + '\n');
console.log(`tokens.css e tokens.json gerados (${Object.keys(fm.scale.type).length} degraus de tipo).`);
```

- [ ] **Step 4: Rodar o gerador**

Run: `cd tools/design-tokens && npm run build`
Expected: `tokens.css e tokens.json gerados (9 degraus de tipo).` e os dois arquivos criados em `apresentacao/`.

- [ ] **Step 5: Conferir o `tokens.css` gerado**

Run: `head -20 apresentacao/tokens.css`
Expected: `--step-0: clamp(1rem, 0.9235rem + 0.3265vw, 1.25rem);` (ou valores equivalentes arredondados) e `--font-size-body: var(--step-0);`.

- [ ] **Step 6: Commit**

```bash
git add tools/design-tokens apresentacao/tokens.css apresentacao/tokens.json
git commit -m "build: gerador de tokens DESIGN.md -> css/json (Utopia clamp)"
```

---

### Task 3: Carregar `tokens.css` nos três clientes

**Files:**
- Modify: `apresentacao/index.html:10`
- Modify: `apresentacao/apresentador/index.html` (bloco `<head>`)
- Modify: `apresentacao/remoto/index.html` (bloco `<head>`)

**Interfaces:**
- Consumes: `apresentacao/tokens.css` (Task 2).
- Produces: `:root` global com todos os tokens disponível antes de `style.css`.

- [ ] **Step 1: Linkar `tokens.css` antes de `style.css` no Projetor**

Em `apresentacao/index.html`, trocar:
```html
  <link rel="stylesheet" href="style.css?v=1">
```
por:
```html
  <link rel="stylesheet" href="tokens.css?v=1">
  <link rel="stylesheet" href="style.css?v=1">
```

- [ ] **Step 2: Fazer o mesmo no Console e no Remoto**

No `<head>` de `apresentador/index.html` e `remoto/index.html`, adicionar `<link rel="stylesheet" href="../tokens.css?v=1">` como primeira folha de estilo (ajustar caminho relativo — ambos estão em subpasta).

- [ ] **Step 3: Verificar que os tokens resolvem**

Run: subir servidor e no Chrome DevTools MCP avaliar `getComputedStyle(document.documentElement).getPropertyValue('--font-size-title')`.
Expected: retorna uma string `clamp(...)` não-vazia.

- [ ] **Step 4: Commit**

```bash
git add apresentacao/index.html apresentacao/apresentador/index.html apresentacao/remoto/index.html
git commit -m "feat: carrega tokens.css nos tres clientes"
```

---

### Task 4: Migrar o `:root` cromático e refatorar `style.css` para tokens semânticos

**Files:**
- Modify: `apresentacao/style.css` (`:root` e ~150 `font-size` + espaços)

**Interfaces:**
- Consumes: tokens de `tokens.css` (Task 2/3).
- Produces: `style.css` sem valores de tamanho avulsos; cores só via `--color-*`.

- [ ] **Step 1: Remover o bloco cromático duplicado do `:root` de `style.css`**

As cores agora vivem em `tokens.css`. Em `style.css`, apagar do `:root` as linhas `--color-*` e `--font-display`/`--font-body` (agora geradas), mantendo apenas o que não é token de design (ex.: `--slide-aspect-ratio`, transições). Conferir que nada quebra (tokens vêm de `tokens.css`, carregado antes).

- [ ] **Step 2: Aplicar a tabela de mapeamento tamanho→token (script)**

Mapa (rem avulso → token semântico), aplicado por `sed` em `style.css`:

| Faixa rem | Token |
|---|---|
| ≥ 4.6 | `var(--font-size-hero)` |
| 3.0–3.8 | `var(--font-size-display)` |
| 2.2–2.9 | `var(--font-size-heading)` |
| 1.75–2.1 | `var(--font-size-title)` |
| 1.5–1.7 | `var(--font-size-subtitle)` |
| 1.2–1.49 | `var(--font-size-body-lg)` |
| 1.0–1.19 | `var(--font-size-body)` |
| 0.85–0.99 | `var(--font-size-small)` |
| ≤ 0.84 | `var(--font-size-caption)` |

Rodar substituições explícitas por valor (ex.: `s/font-size: 5.8rem/font-size: var(--font-size-hero)/g`), uma por valor distinto observado no grep. Fazer backup antes.

- [ ] **Step 3: Verificar visualmente a capa e 2 slides após o remapeamento**

Run: servir + Chrome DevTools MCP screenshot da capa, slide 3, slide 9.
Expected: hierarquia preservada (hero grande, títulos, corpo), sem tamanhos absurdos; comparar com screenshots anteriores.

- [ ] **Step 4: Substituir paddings/gaps fixos por `--space-*` nos containers principais**

Alvos de maior impacto (não exaustivo nesta task): `.slide-section` padding lateral, `.slide-frame` padding vertical, gaps de grids de cards. Trocar valores em `rem`/`px` pelos `--space-*` mais próximos.

- [ ] **Step 5: Commit**

```bash
git add apresentacao/style.css
git commit -m "refactor: style.css consome tokens semanticos (tipo/espaco)"
```

---

### Task 5: Refatorar `slides-extra.css` para tokens semânticos

**Files:**
- Modify: `apresentacao/slides-extra.css` (~30 `font-size` + espaços)

**Interfaces:**
- Consumes: tokens de `tokens.css`.
- Produces: componentes custom (iceberg, timeline, balança, roadmap) sem tamanhos avulsos.

- [ ] **Step 1: Aplicar a mesma tabela de mapeamento (Task 4 Step 2) em `slides-extra.css`**

Mesmas substituições por valor. Atenção aos degraus pequenos (0.55–0.72rem → `--font-size-caption`).

- [ ] **Step 2: Verificar os componentes custom no navegador**

Run: Chrome DevTools MCP screenshot de: slide 3 (iceberg), slide 6 (timeline 2 pistas), slide 9 (balança).
Expected: componentes legíveis e proporcionais; nada colapsado.

- [ ] **Step 3: Commit**

```bash
git add apresentacao/slides-extra.css
git commit -m "refactor: slides-extra.css consome tokens semanticos"
```

---

### Task 6: Painel de tweaks dev-only (Tweakpane, `?dev`)

**Files:**
- Create: `apresentacao/dev-panel.js`
- Modify: `apresentacao/index.html` (script condicional)

**Interfaces:**
- Consumes: CSS custom properties do `:root` (live).
- Produces: overlay que edita `--step-*`/`--space-*`/`--color-*` ao vivo e exporta os valores no formato do frontmatter do `DESIGN.md`.

- [ ] **Step 1: Criar `apresentacao/dev-panel.js`**

```js
(async () => {
  if (!new URLSearchParams(location.search).has('dev')) return;
  const { Pane } = await import('https://cdn.jsdelivr.net/npm/tweakpane@4.0.4/dist/tweakpane.min.js');
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const pane = new Pane({ title: 'Tweaks (dev)' });

  // Fator de escala global: reaplica multiplicador nos degraus de tipo
  const state = { typeScale: 1, spaceScale: 1,
    primary: css.getPropertyValue('--color-primary').trim(),
    accent: css.getPropertyValue('--color-accent').trim() };

  const steps = ['-2','-1','0','1','2','3','4','5','6'];
  const baseType = steps.map(s => css.getPropertyValue(`--step-${s}`).trim());

  pane.addBinding(state, 'typeScale', { min: 0.75, max: 1.5, step: 0.01 })
    .on('change', () => steps.forEach((s,i) =>
      root.style.setProperty(`--step-${s}`, `calc(${baseType[i]} * ${state.typeScale})`)));

  pane.addBinding(state, 'primary').on('change', () =>
    root.style.setProperty('--color-primary', state.primary));
  pane.addBinding(state, 'accent').on('change', () =>
    root.style.setProperty('--color-accent', state.accent));

  pane.addButton({ title: 'Exportar p/ DESIGN.md (clipboard)' }).on('click', () => {
    const out = [
      '# Cole em DESIGN.md > tokens.color / scale (ajuste manual dos min/max):',
      `primary: "${state.primary}"`,
      `accent:  "${state.accent}"`,
      `# typeScale sugerido (multiplicar min/max dos degraus): ${state.typeScale}`,
    ].join('\n');
    navigator.clipboard.writeText(out);
    console.log(out);
  });
})();
```

- [ ] **Step 2: Carregar o painel condicionalmente no Projetor**

Em `apresentacao/index.html`, antes de `</body>`:
```html
  <script type="module" src="dev-panel.js?v=1"></script>
```
(O próprio script sai cedo se não houver `?dev` — custo zero em produção.)

- [ ] **Step 3: Verificar o painel**

Run: abrir `http://localhost:PORT/?dev`, Chrome DevTools MCP screenshot.
Expected: painel Tweakpane no canto; arrastar `typeScale` muda o tamanho de todos os textos ao vivo; abrir sem `?dev` → sem painel.

- [ ] **Step 4: Commit**

```bash
git add apresentacao/dev-panel.js apresentacao/index.html
git commit -m "feat: painel de tweaks dev-only (Tweakpane, ?dev)"
```

---

### Task 7: Verificação responsiva (desktop ↔ mobile)

**Files:** nenhum (verificação); eventuais ajustes finos em `style.css`.

**Interfaces:**
- Consumes: apresentação completa com tokens fluidos.

- [ ] **Step 1: Testar em 4 larguras via Chrome DevTools MCP**

Redimensionar viewport para 375 (mobile), 768 (tablet), 1280 (desktop), 1920 (projeção) e screenshot da capa, slide 3 e slide 7 em cada.
Expected: sem overflow (ex.: o título cortado do slide 7 deve caber), sem texto grande/pequeno demais, hierarquia preservada.

- [ ] **Step 2: Conferir alvo de toque no Remoto @375**

Expected: botões ≥ 44px; teleprompter legível.

- [ ] **Step 3: Ajustar `--space-*` de containers que ainda quebrarem (se houver)**

Aplicar correção mínima só onde a Step 1 apontou problema real.

- [ ] **Step 4: Commit (se houve ajuste)**

```bash
git add apresentacao/style.css
git commit -m "fix: ajustes responsivos apos verificacao em 4 breakpoints"
```

---

### Task 8: Catalogar e proteger contra regressão (docs + memória)

**Files:**
- Modify: `DESIGN.md` (seções de catálogo), `CLAUDE.md`
- Modify: memória do projeto

**Interfaces:**
- Produces: documentação canônica da taxonomia + regra "tokens.css é gerado".

- [ ] **Step 1: Completar no `DESIGN.md` as seções "Espaçamento", "Raio" e "Como regenerar"**

Documentar a escala de espaço, os raios, e o comando `cd tools/design-tokens && npm run build`. Do/don't: "nunca editar `tokens.css` à mão".

- [ ] **Step 2: Atualizar `CLAUDE.md` do projeto**

Adicionar: "`apresentacao/tokens.css` e `tokens.json` são gerados por `tools/design-tokens/build.mjs` a partir do `DESIGN.md`. Para mudar tokens, edite o `DESIGN.md` e rode o build. Nunca edite `tokens.css` à mão."

- [ ] **Step 3: Atualizar a memória `scin-design-system`**

Registrar: taxonomia de 3 camadas, escala fluida (Utopia/clamp), pipeline de build, painel `?dev`.

- [ ] **Step 4: Commit**

```bash
git add DESIGN.md CLAUDE.md
git commit -m "docs: cataloga escala/espaco/raio e pipeline de tokens"
```

---

## Self-Review (feito pelo autor do plano)

- **Cobertura da spec:** taxonomia (Tasks 1,8) · hierarquia título/subtítulo/corpo (Tasks 1,4,5) · tamanhos fluidos/adaptativos (Tasks 1,2,7) · painel de tweaks + geração do DESIGN.md (Tasks 2,6). ✔
- **Placeholders:** min/max exatos, código do gerador completo, snippet do painel completo, tabela de mapeamento explícita. ✔
- **Consistência de tipos:** `fluidClamp(minPx,maxPx,vwMin,vwMax)`, `--step-N`, `--font-size-*`, `--space-*` usados igual em todas as tasks. ✔

## Riscos e decisões em aberto (para anotar)

1. **Git:** o projeto não é repositório git. Fazer `git init` (commits do plano) ou seguir sem versionamento? (afeta todos os "Commit").
2. **Faixa de viewport 375→1600:** boa pra desktop+mobile; se a projeção final for 4K, avaliar subir o `max`.
3. **Mapeamento de tamanhos (Task 4/5):** é semi-automático por faixa — vale uma revisão visual humana nos slides-chave (já prevista nas Steps de verificação).
4. **Node/`js-yaml`:** exige `npm install` na `tools/design-tokens/`. Ok? (Node já é usado no `server/`.)
5. **Escopo do painel:** só Projetor, ou também Console/Remoto?
