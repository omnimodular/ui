import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const dist = new URL('../apps/single-theme-fixture/dist/', import.meta.url).pathname;
const otherThemes = [
  'enterprise-slate', 'cyberpunk-neon', 'high-contrast-clarity', 'pastel-soft', 'editorial-serif',
  'botanical-earth', 'ocean-glass', 'retro-terminal', 'playful-geometric',
];
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
}
const artifacts = await files(dist);
const contents = await Promise.all(artifacts.map(async (file) => ({ file, text: await readFile(file, 'utf8').catch(() => '') })));
const leaks = [];
for (const { file, text } of contents) {
  for (const id of otherThemes) if (text.includes(id)) leaks.push({ file, id });
}
assert.deepEqual(leaks, [], `Unrelated theme definitions found: ${JSON.stringify(leaks)}`);
assert(contents.some(({ text }) => text.includes('minimalist-nordic')), 'The selected theme ID is missing from the fixture.');
const report = {
  passed: true,
  selectedTheme: 'minimalist-nordic',
  excludedThemes: otherThemes,
  inspectedFiles: artifacts.map((file) => file.slice(dist.length)),
  leaks,
};
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/bundle-isolation.json', JSON.stringify(report, null, 2));
console.log(`Bundle isolation passed: inspected ${artifacts.length} artifacts; all nine unrelated theme IDs are absent.`);
