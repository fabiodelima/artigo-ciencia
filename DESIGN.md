---
name: SCIN — Epistemologia da Construção (Seminário Koskela 2017)
description: "Sistema de design da apresentação HTML/FabSlides. Adaptação do repertório Red Broadcast para um seminário acadêmico: base bege clara, azul estrutural mais presente e vermelho de tensão."
tokens:
  color:
    # Estrutura — azul utilitário inspirado em interface broadcast
    primary:          "#065FD4"   # links, títulos, estrutura
    primary-deep:     "#174A9C"   # fundo hero / seções dark
    primary-darkest:  "#0A2F6B"   # fim de gradiente escuro
    primary-mid:      "#3EA6FF"   # estados frios e bordas sobre dark
    primary-soft:     "#E8F0FE"   # tint azul p/ fundos de card
    # Tensão — vermelho broadcast, só em patologia / problema oculto / crítica
    accent:           "#FF0000"   # destaque / alerta
    accent-deep:      "#CC0000"   # texto / borda de ênfase
    accent-soft:      "#FFE5E5"   # tint vermelho p/ card de patologia
    # Neutros claros e densos
    bg:               "#FBF9F8"   # fundo claro principal
    surface:          "#FFFFFF"   # cards
    surface-alt:      "#F5F3F3"   # superfície neutra alternativa
    ink:              "#0F0F0F"   # texto principal
    on-dark:          "#FFFFFF"   # texto sobre fundo escuro
    muted:            "#606060"   # legendas / suporte
    border:           "#E5E5E5"
  font:
    display: "'Roboto', 'Segoe UI', sans-serif"   # títulos
    body:    "'Roboto', -apple-system, sans-serif" # corpo
  radius:
    card: "12px"
    control: "8px"
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
---

# DESIGN.md — Apresentação SCIN (Epistemologia da Construção)

Fonte da verdade visual da apresentação. Os tokens acima (YAML) geram
`apresentacao/tokens.css` e `apresentacao/tokens.json` via
`tools/design-tokens/build.mjs`. Ao gerar ou editar qualquer UI deste projeto,
consulte este arquivo e use os tokens semânticos — nunca reintroduza cores
literais de marca.

## 1. Tema visual & atmosfera

Seminário de mestrado sobre epistemologia da engenharia de construção
(Koskela et al., 2017). O tom segue **acadêmico, técnico e sóbrio**, mas com
uma gramática visual mais próxima de plataformas broadcast: leitura rápida,
contraste alto, superfícies limpas e hierarquia compacta. O azul volta a ter
mais protagonismo estrutural, inclusive em áreas de profundidade e apoio, enquanto
o vermelho mantém a nitidez "on air" e segue restrito a crítica, patologia e
tensão conceitual.

## 2. Paleta de cores & papéis

| Papel | Token CSS | Hex | Uso |
|---|---|---|---|
| Azul primário | `--color-primary` | `#065FD4` | links, títulos, ícones, estrutura |
| Azul profundo | `--color-primary-deep` | `#174A9C` | fundo de seções `.dark`, hero |
| Azul escuro | `--color-primary-darkest` | `#0A2F6B` | fim de gradiente escuro |
| Azul médio | `--color-primary-mid` | `#3EA6FF` | bordas frias, estados sobre dark |
| Azul tint | `--color-primary-soft` | `#E8F0FE` | fundo de cards estruturais |
| Vermelho acento | `--color-accent` | `#FF0000` | **só** tensão: alerta, destaque crítico |
| Vermelho profundo | `--color-accent-deep` | `#CC0000` | borda/ênfase sobre tint vermelho |
| Vermelho tint | `--color-accent-soft` | `#FFE5E5` | fundo de card de patologia |
| Fundo | `--color-bg` | `#FBF9F8` | fundo claro da apresentação |
| Superfície | `--color-surface` | `#FFFFFF` | cards |
| Superfície alt | `--color-surface-alt` | `#F5F3F3` | painéis neutros do console |
| Texto | `--color-ink` | `#0F0F0F` | corpo escuro |
| Texto claro | `--color-on-dark` | `#FFFFFF` | sobre fundo escuro |
| Suporte | `--color-muted` | `#606060` | legendas |
| Borda | `--color-border` | `#E5E5E5` | dividers e outlines |

Acentos categóricos secundários (âmbar `#E5C158`, roxo `#8C529F`) são
permitidos **apenas** para diferenciar itens de uma mesma lista (ex.: etapas do
roadmap) — nunca como cor de marca.

## 3. Tipografia

- **Títulos** — `--font-display` (**Roboto**), pesos 500–700, compactos,
  diretos e sem teatralidade. Sentence case.
- **Corpo** — `--font-body` (**Roboto**), pesos 400–500, `line-height` ~1.6.
- Sem serifas editoriais e sem contraste de fontes por “clima”; a clareza
  funcional do sistema de referência vale mais do que assinatura tipográfica.

### 3.1 Taxonomia de tokens (3 camadas — padrão W3C DTCG)

| Camada | Papel | Exemplos neste projeto |
|---|---|---|
| **Primitivo** | valor cru, sem semântica | `--step-3`, `--space-m`, `--radius-card` |
| **Semântico** | intenção → aponta pro primitivo | `--font-size-title`, `--color-accent` |
| **Componente** | específico de um componente → aponta pro semântico | `--hero-title-size`, `--card-pathology-pad` |

Regra: componente **nunca** referencia primitivo direto — sempre via semântico.
`tokens.css` (gerado — ver §9) implementa as três camadas; nada aqui é editado
à mão nesse arquivo.

### 3.2 Escala fluida de tipografia (método Utopia, `clamp()`)

Interpolação entre **375px** (mobile) e **1600px** (projeção). Cada degrau
`min@375 → max@1600` respeita `max ≤ 2.5 × min` (WCAG SC 1.4.4 — zoom seguro):

| Degrau | min (px) | max (px) | Token semântico | Papel |
|---|---|---|---|---|
| `--step--2` | 12 | 14 | `--font-size-caption` | legenda |
| `--step--1` | 14 | 16 | `--font-size-small` | rótulo |
| `--step-0`  | 16 | 20 | `--font-size-body` | corpo |
| `--step-1`  | 19 | 25 | `--font-size-body-lg` | lead |
| `--step-2`  | 23 | 31 | `--font-size-subtitle` | subtítulo |
| `--step-3`  | 28 | 39 | `--font-size-title` | título |
| `--step-4`  | 33 | 49 | `--font-size-heading` | heading grande |
| `--step-5`  | 40 | 61 | `--font-size-display` | display |
| `--step-6`  | 48 | 76 | `--font-size-hero` | hero (capa) |

### 3.3 Espaçamento fluido

Mesmo método, aplicado a paddings/gaps — `min@375 → max@1600` (px):

| Token | min | max |
|---|---|---|
| `--space-3xs` | 4 | 5 |
| `--space-2xs` | 8 | 10 |
| `--space-xs` | 12 | 15 |
| `--space-s` | 16 | 20 |
| `--space-m` | 24 | 30 |
| `--space-l` | 32 | 40 |
| `--space-xl` | 48 | 60 |
| `--space-2xl` | 64 | 80 |
| `--space-3xl` | 96 | 120 |

**Do**: usar sempre `var(--font-size-*)` / `var(--space-*)`.
**Don't**: nunca escrever `font-size`/`padding`/`gap` com valor `rem`/`px` cru —
isso quebra a escala e reintroduz o problema que motivou esta seção (antes da
refatoração havia ~180 declarações de `font-size` usando ~48 valores soltos,
sem hierarquia nomeada nem proporcionalidade entre telas).

### 3.4 Raio

| Token | Valor | Uso |
|---|---|---|
| `--radius-control` | `8px` | botões, inputs, pills compactas e controles |
| `--radius-card` | `12px` | cards, painéis e superfícies maiores |
| `--radius-pill` | `999px` | badges, chips e elementos totalmente arredondados |

## 4. Componentes

- **Cards**: `--color-surface`, borda `--color-border`,
  `border-radius: var(--radius-card)`, com prioridade para contorno em vez de sombra.
- **Card de patologia/tensão**: fundo `--color-accent-soft`, borda/realce
  `--color-accent`, texto `--color-accent-deep`.
- **Seção dark** (`.slide-section.dark`): base azul profunda
  `--color-primary-deep` → `--color-primary-darkest`, texto `--color-on-dark`.
- **Badges de integrante** (Console): mantêm cores individuais já definidas.
- **Links / destaques estruturais**: `--color-primary`.

## 5. Layout

- Slides full-viewport com scroll-snap (16/9 lógico), padding lateral generoso.
- Ritmo vertical e gaps internos usam `--space-*`.
- Máx. largura de conteúdo ~1560px.

## 6. Profundidade & elevação

- Superfícies planas. Preferir borda e contraste a sombra. Quando houver
  elevação, usar sombra curta e neutra baseada em preto translúcido.

## 7. Do's & Don'ts

**Do**
- Use vermelho **exclusivamente** onde há tensão conceitual: slide 3 (problema
  oculto/iceberg), 7–8 (patologias), 10 (crítica).
- Use azul como cor estrutural padrão de todo o resto.
- Mantenha os fundos claros e deixe o conteúdo ser o elemento dominante.
- Refira sempre tokens semânticos (`var(--color-primary)`).

**Don't**
- Não reintroduza creme/"papel envelhecido", verde-moscatel ou laranja (paleta
  antiga de vinícola).
- Não use vermelho como decoração ou em elementos neutros.
- Não use Sora/Inter/Playfair/Outfit nem serifas editoriais.
- Não hardcode hex de marca — mude o valor **aqui** e regenere os tokens.

## 8. Responsividade

- Alvo primário: projeção 16/9 em tela cheia. Console/Remoto adaptam em telas
  menores (o Remoto é usado no celular). Toque mínimo 44px no Remoto.

## 9. Como regenerar tokens

`apresentacao/tokens.css` e `apresentacao/tokens.json` são artefatos gerados.
Não edite esses arquivos à mão. Para mudar cor, tipografia, escala de espaço ou
raio:

1. Edite o frontmatter YAML deste `DESIGN.md`.
2. Rode `npm run build` dentro de `tools/design-tokens`.
3. Verifique os três clientes: Projetor, Console do Apresentador e Remoto.

Fluxo canônico: `DESIGN.md -> tools/design-tokens/build.mjs -> tokens.css/json
-> apresentação`.

## 10. Guia rápido para agentes (prompt)

> Estilo: azul utilitário `#065FD4`, base dark azul `#174A9C` / `#0A2F6B`,
> vermelho de tensão `#FF0000` (só em patologia/crítica), fundo bege claro
> `#FBF9F8` com superfícies `#FFFFFF` e `#F5F3F3`.
> Títulos e corpo em Roboto, sentence case. Superfícies planas, cards 12px,
> borda antes de sombra. Sempre via tokens `--color-*` de
> `apresentacao/tokens.css`, gerado a partir do `DESIGN.md`.
