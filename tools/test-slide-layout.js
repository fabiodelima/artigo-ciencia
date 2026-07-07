const fs = require('fs');
const path = require('path');

// Target paths
const htmlPath = path.join(__dirname, '..', 'apresentacao', 'index.html');
const cssPath = path.join(__dirname, '..', 'apresentacao', 'slides-extra.css');

console.log('=== INICIANDO BATERIA DE TESTES DE GABARITO VISUAL (SLIDE 4) ===');

let failures = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`\x1b[32m✔ [PASS]\x1b[0m ${message}`);
  } else {
    console.error(`\x1b[31m✘ [FAIL]\x1b[0m ${message}`);
    failures++;
  }
}

// 1. Validar existência de arquivos
assert(fs.existsSync(htmlPath), 'Arquivo apresentacao/index.html existe.');
assert(fs.existsSync(cssPath), 'Arquivo apresentacao/slides-extra.css existe.');

if (failures > 0) {
  console.error(`Falha crítica nos arquivos base. Abortando.`);
  process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 2. Validar que não há lixo visual residual de setas unicode cagadas
assert(!htmlContent.includes('↙') && !htmlContent.includes('↗'), 'Nenhum caractere de seta unicode diagonal sobrou no HTML.');
assert(!htmlContent.includes('<span class="flow-arrow-symbol">➔</span>'), 'Seta unicode horizontal removida do Platonismo.');

// 3. Validar estrutura híbrida e wrapper isolado no HTML
assert(htmlContent.includes('class="theory-cycle-wrapper"'), 'Wrapper da ciclogravura ".theory-cycle-wrapper" presente no HTML.');
assert(htmlContent.includes('class="grid-arrows"'), 'Elemento SVG ".grid-arrows" presente no HTML.');
assert(htmlContent.includes('class="theory-cycle-grid"'), 'Elemento HTML ".theory-cycle-grid" presente.');

// 4. Validar quantidade correta de nós e labels
const cycleNodesCount = (htmlContent.match(/class="cycle-node/g) || []).length;
assert(cycleNodesCount === 3, `Encontrados exatamente 3 nós HTML (Observação, Diagnóstico, Teoria) no Aristotelismo. Encontrado: ${cycleNodesCount}`);

const cycleLabelsCount = (htmlContent.match(/class="cycle-label/g) || []).length;
assert(cycleLabelsCount === 3, `Encontradas exatamente 3 labels HTML (Abdução, Dedução, Indução) no Aristotelismo. Encontrado: ${cycleLabelsCount}`);

// 5. Validar injeção de estilo inline na head (Anti-cache)
assert(htmlContent.includes('id="slide-04-styles"'), 'Folha de estilos inline "slide-04-styles" injetada com sucesso no HTML.');

// Extrair conteúdo da folha inline
const styleBlockMatch = htmlContent.match(/<style id="slide-04-styles">([\s\S]*?)<\/style>/);
assert(styleBlockMatch !== null, 'Foi possível capturar e ler o bloco <style> inline.');

if (styleBlockMatch) {
  const inlineCss = styleBlockMatch[1];

  // 6. Validar regras de dimensionamento para caixas no CSS inline
  assert(inlineCss.includes('width: 160px !important') || inlineCss.includes('width: 160px'), 'Largura dos nós do Aristotelismo definida para 160px.');
  assert(inlineCss.includes('width: 150px !important') || inlineCss.includes('width: 150px'), 'Largura dos nós do Platonismo definida para 150px.');
  assert(inlineCss.includes('grid-template-columns: 160px 100px 160px'), 'Colunas do grid dimensionadas precisamente para 160px / 100px / 160px.');

  // 7. Validar regra anti-overflow (padding curto + flex-start)
  assert(inlineCss.includes('padding-top: 4vh') || inlineCss.includes('padding-top: 3vh'), 'Padding vertical do slide reduzido para evitar overflow.');
  assert(inlineCss.includes('justify-content: flex-start'), 'Alinhamento vertical do slide definido para flex-start para não cortar no rodapé.');

  // 8. Validar posicionamento de setas absolutas
  assert(inlineCss.includes('position: absolute !important') && inlineCss.includes('.theory-cycle-wrapper'), 'As setas conectoras do Aristotelismo estão marcadas como absolute no wrapper.');
  assert(inlineCss.includes('position: relative !important') && inlineCss.includes('.theory-cycle-wrapper'), 'O wrapper da ciclogravura está marcado como relative para conter as setas absolutas.');
}

// 9. Validar limpeza em slides-extra.css
assert(!cssContent.includes('.theory-cycle-grid') && !cssContent.includes('.theory-flow-horizontal'), 'Antigas classes deletadas de slides-extra.css para evitar conflito ou duplicidade.');

console.log('---------------------------------------------------------');
if (failures === 0) {
  console.log('\x1b[32m=== BATERIA DE TESTES CONCLUÍDA: 100% SUCESSO! ===\x1b[0m');
  process.exit(0);
} else {
  console.error(`\x1b[31m=== BATERIA DE TESTES CONCLUÍDA: ${failures} FALHA(S) IDENTIFICADA(S) ===\x1b[0m`);
  process.exit(1);
}
