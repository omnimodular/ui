import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { themes } from '../apps/dashboard/src/themes';

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]);
}

describe('package boundaries and prohibited theme styling', () => {
  it('keeps core and components independent of the theme catalog', () => {
    const sourceFiles = [...files('packages/core/src'), ...files('packages/components/src')].filter((file) => /\.(ts|css)$/.test(file));
    for (const file of sourceFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/@omni-ui\/theme-|apps\/dashboard\/src\/themes/);
      expect(source, file).not.toMatch(/data-om-theme\s*=\s*["'](?:minimalist|enterprise|cyberpunk|high-contrast|pastel|editorial|botanical|ocean|retro|playful)/);
    }
    const componentCss = readFileSync('packages/components/src/styles.css', 'utf8');
    expect(componentCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('has no cross-imports between standalone theme packages', () => {
    for (const theme of themes) {
      const source = readFileSync(`packages/themes/${theme.id}/src/tokens.ts`, 'utf8');
      expect(source).not.toMatch(/@omni-ui\/theme-/);
      expect(source).not.toMatch(/apps\/dashboard/);
    }
  });
});
