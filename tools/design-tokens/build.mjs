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
