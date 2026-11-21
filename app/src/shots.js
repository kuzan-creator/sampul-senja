// Fixed scenes for screenshots: ?shot=cover|editor sets up a deterministic cover and editor,
// then sets window.__shotReady once painted. `seed` fixes the grain and the panel crops.
export async function runShot(app, shot, query) {
  const seed = Number(query.get('seed') ?? 1);
  app.state.seed = seed;
  app.setSize(query.get('size') ?? 'square', { silent: true });
  app.setLayout(query.get('layout') ?? 'hero', { silent: true });
  app.setGrade(query.get('grade') ?? 'senja', { silent: true });
  app.setTitle(query.get('title') ?? 'SAMPUL SENJA', { silent: true });
  app.setSubtitle(query.get('sub') ?? 'KOTA DI UJUNG SENJA', { silent: true });
  app.setTitleScale(1, { silent: true });
  await app.ensureSamples();
  app.resetPanels(seed);
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await app.waitForFonts();
  app.render();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
