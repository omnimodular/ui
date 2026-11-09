import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('apps/dashboard/dist');
const basePath = `${(process.env.PAGES_BASE_PATH ?? '').replace(/\/$/, '')}/`;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
let server;
let browser;
try {
  let url = process.env.PAGES_URL;
  if (!url) {
    server = createServer(async (request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = resolve(root, pathname.slice(basePath.length) || 'index.html');
      if (!pathname.startsWith(basePath) || !file.startsWith(root + sep)) {
        response.writeHead(404).end(); return;
      }
      try {
        const body = await readFile(file);
        response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' }).end(body);
      } catch { response.writeHead(404).end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${server.address().port}${basePath}`;
  }
  const executablePath = process.env.CHROME_PATH ?? ['/root/.local/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const failures = [];
  const responses = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('requestfailed', request => failures.push(request.url()));
  page.on('response', response => {
    responses.push(response.url());
    if (!response.ok()) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(url);
  await page.locator('#app').waitFor({ state: 'visible' });
  assert(await page.locator('html').getAttribute('data-om-mode'), 'Early theme script must run');
  for (const file of ['early-theme.css', 'early-theme.js']) {
    assert(responses.includes(new URL(file, url).href), `Missing ${file} under the Pages base path`);
  }
  const themes = await page.locator('#theme-select option').evaluateAll(options => options.map(option => option.value));
  assert.equal(themes.length, 10);
  for (const theme of themes) {
    await page.locator('#theme-select').selectOption(theme);
    await page.waitForFunction(id => document.body.dataset.omTheme === id && !document.querySelector('#theme-select').disabled, theme);
  }
  await page.locator('#navigation-layout').selectOption('top');
  await page.locator('[data-nav-id="components"]').click();
  assert(await page.locator('#view-components').isVisible());
  await page.locator('#navigation-layout').selectOption('sidebar');
  await page.locator('#navigation-folding').check();
  await page.locator('#sidebar-collapse').click();
  assert.equal(await page.locator('#app').getAttribute('data-om-collapsed'), 'true');
  await page.reload();
  await page.locator('#app').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#theme-select').inputValue(), themes.at(-1));
  assert.deepEqual(failures, [], 'No failed assets or browser errors');
  console.log(`Pages smoke test passed: ${url}, early assets, 10 lazy themes, navigation, reload.`);
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
