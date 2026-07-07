(async () => {
  if (!new URLSearchParams(location.search).has('dev')) return;
  const { Pane } = await import('https://cdn.jsdelivr.net/npm/tweakpane@4.0.4/dist/tweakpane.min.js');
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const pane = new Pane({ title: 'Tweaks (dev)' });

  const state = { typeScale: 1, spaceScale: 1,
    primary: css.getPropertyValue('--color-primary').trim(),
    accent: css.getPropertyValue('--color-accent').trim() };

  const steps = ['-2','-1','0','1','2','3','4','5','6'];
  const baseType = steps.map(s => css.getPropertyValue(`--step-${s}`).trim());

  const spaces = ['3xs','2xs','xs','s','m','l','xl','2xl','3xl'];
  const baseSpace = spaces.map(s => css.getPropertyValue(`--space-${s}`).trim());

  pane.addBinding(state, 'typeScale', { min: 0.75, max: 1.5, step: 0.01 })
    .on('change', () => steps.forEach((s, i) =>
      root.style.setProperty(`--step-${s}`, `calc(${baseType[i]} * ${state.typeScale})`)));

  pane.addBinding(state, 'spaceScale', { min: 0.75, max: 1.5, step: 0.01 })
    .on('change', () => spaces.forEach((s, i) =>
      root.style.setProperty(`--space-${s}`, `calc(${baseSpace[i]} * ${state.spaceScale})`)));

  pane.addBinding(state, 'primary').on('change', () =>
    root.style.setProperty('--color-primary', state.primary));
  pane.addBinding(state, 'accent').on('change', () =>
    root.style.setProperty('--color-accent', state.accent));

  pane.addButton({ title: 'Exportar p/ DESIGN.md (clipboard)' }).on('click', () => {
    const out = [
      '# Cole em DESIGN.md > tokens.color / scale (ajuste manual dos min/max):',
      `primary: "${state.primary}"`,
      `accent:  "${state.accent}"`,
      `# typeScale sugerido (multiplicar min/max dos degraus de scale.type): ${state.typeScale}`,
      `# spaceScale sugerido (multiplicar min/max de scale.space): ${state.spaceScale}`,
    ].join('\n');
    navigator.clipboard.writeText(out);
    console.log(out);
  });
})();
