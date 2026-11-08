import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import assert from 'node:assert/strict';

const root = new URL('../apps/dashboard/dist/', import.meta.url).pathname;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname)).replace(/^\.\.(\/|\\)/g, '');
  const file = join(root, path === '/' ? 'index.html' : path);
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' }); response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));
const executablePath = process.env.CHROME_PATH ?? ['/root/.local/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const themeIds = process.env.DEBUG_A11Y ? ['minimalist-nordic'] : ['minimalist-nordic', 'enterprise-slate', 'cyberpunk-neon', 'high-contrast-clarity', 'pastel-soft', 'editorial-serif', 'botanical-earth', 'ocean-glass', 'retro-terminal', 'playful-geometric'];
const results = [];
const functionalChecks = [];
async function axe(label) {
  // Let theme and navigation transitions finish before measuring computed colors.
  await page.waitForTimeout(350);
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  results.push({ label, violations: report.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary, data: node.any.map((check) => check.data) })) })) });
}
try {
  await page.goto('http://127.0.0.1:4173');
  await page.locator('#app').waitFor({ state: 'visible' });
  for (const themeId of themeIds) {
    await page.locator('#theme-select').selectOption(themeId);
    await page.waitForFunction((id) => document.body.dataset.omTheme === id && !document.querySelector('#theme-select').disabled, themeId);
    for (const mode of ['light', 'dark']) {
      await page.locator(`input[name="mode"][value="${mode}"]`).check();
      await page.waitForFunction((value) => document.body.dataset.omMode === value, mode);
      await axe(`${themeId}/${mode}/dashboard`);
      await page.locator('[data-nav-id="components"]').click();
      await axe(`${themeId}/${mode}/components`);
      await page.locator('#dialog-demo').click();
      await axe(`${themeId}/${mode}/dialog`);
      await page.keyboard.press('Escape');
      await page.locator('[data-nav-id="dashboard"]').click();
    }
  }
  const violations = results.flatMap((result) => result.violations.map((violation) => ({ ...violation, view: result.label })));
  assert.deepEqual(violations, [], `axe violations: ${JSON.stringify(violations, null, 2)}`);

  await page.locator('#theme-select').selectOption('minimalist-nordic');
  await page.locator('input[name="mode"][value="light"]').check();
  await page.locator('#new-task').click();
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'task-title');
  await page.locator('#save-task').click();
  assert.equal(await page.locator('#task-title-error').isVisible(), true);
  await page.locator('#task-title').fill('Verify release checklist');
  await page.locator('#task-owner').fill('Avery Stone');
  await page.locator('#task-status').selectOption('In progress');
  await page.locator('#save-task').click();
  await page.locator('#task-search').fill('Verify release checklist');
  await page.locator('#task-table').getByText('Verify release checklist').waitFor();
  await page.reload(); await page.locator('#app').waitFor({ state: 'visible' });
  await page.locator('#task-search').fill('Verify release checklist');
  await page.locator('#task-table').getByText('Verify release checklist').waitFor();
  functionalChecks.push('Task validation, creation, search and persistence passed.');
  await page.locator('#task-table').getByRole('button', { name: 'Edit Verify release checklist' }).click();
  await page.locator('#task-title').fill('Verify production checklist');
  await page.locator('#save-task').click();
  await page.locator('#task-search').fill('Verify production checklist');
  await page.locator('#task-table').getByText('Verify production checklist').waitFor();
  await page.locator('#task-search').fill('no-such-task');
  await page.locator('.empty-state').waitFor();
  functionalChecks.push('Task editing and filtered empty state passed.');
  await page.locator('#task-search').fill('');
  await page.locator('[data-sort-key="title"]').click();
  assert.equal(await page.locator('th[aria-sort="ascending"]').count(), 1);
  await page.screenshot({ path: 'artifacts/dashboard-desktop.png', fullPage: true });
  functionalChecks.push('Table sorting and desktop render passed.');

  await page.evaluate(() => {
    window.__omOriginalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function () { throw new DOMException('Storage denied for test', 'SecurityError'); };
  });
  await page.locator('#new-task').click();
  await page.locator('#task-title').fill('Session-only task');
  await page.locator('#task-owner').fill('Browser Test');
  await page.locator('#save-task').click();
  await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('session-only'));
  await page.evaluate(() => {
    Storage.prototype.setItem = window.__omOriginalSetItem;
    delete window.__omOriginalSetItem;
  });
  functionalChecks.push('Task storage failure preserves a session-only warning.');

  await page.locator('#new-task').click(); await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'new-task');
  functionalChecks.push('Dialog Escape and focus restoration passed.');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('#navigation-toggle').click();
  assert.equal(await page.locator('#navigation-toggle').getAttribute('aria-expanded'), 'true');
  await page.locator('[data-nav-id="components"]').click();
  assert.equal(await page.locator('#view-components').isVisible(), true);
  await page.screenshot({ path: 'artifacts/components-mobile.png', fullPage: true });
  functionalChecks.push('Mobile navigation and responsive component view passed.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.locator('button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  assert(['0s', '0.00001s'].includes(duration) || Number.parseFloat(duration) <= 0.001, `Reduced motion duration was ${duration}`);
  functionalChecks.push('Reduced-motion CSS passed.');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await page.screenshot({ path: 'artifacts/components-forced-colors.png', fullPage: true });
  functionalChecks.push('Forced-colors mode rendered for manual inspection (not an automated conformance claim).');
  console.log(`Accessibility checks passed: ${results.length} axe scans across 20 theme/mode combinations.`);
  for (const check of functionalChecks) console.log(`PASS ${check}`);
} finally {
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/accessibility-results.json', JSON.stringify({ scans: results, functionalChecks }, null, 2));
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
