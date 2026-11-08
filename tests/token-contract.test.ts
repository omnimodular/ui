import { describe, expect, it } from 'vitest';
import {
  TOKEN_CONTRACT_VERSION,
  assertCompatibleContract,
  tokenNames,
  validateThemeTokens,
  type ThemePlugin,
} from '@omni-ui/token-contract';
import { themes } from '../apps/dashboard/src/themes';
import manifestSchema from '@omni-ui/token-contract/manifest-schema.json';

describe('theme token contract', () => {
  it('ships exactly ten unique, manifest-compatible standalone themes', () => {
    expect(themes).toHaveLength(10);
    expect(new Set(themes.map((theme) => theme.id)).size).toBe(10);
    for (const theme of themes) {
      expect(theme.contractVersion).toBe(TOKEN_CONTRACT_VERSION);
      expect(theme.modes).toEqual(expect.arrayContaining(manifestSchema.properties.modes.items.enum));
      expect(theme.id).toMatch(new RegExp(manifestSchema.properties.id.pattern));
      expect(theme.version).toMatch(/^\d+\.\d+\.\d+/);
    }
  });

  it.each(themes.map((theme) => [theme.id, theme] as [string, ThemePlugin]))(
    '%s resolves every required token in both appearances', async (_id, theme) => {
      const definition = await theme.load();
      for (const mode of ['light', 'dark'] as const) {
        expect(Object.keys(definition[mode])).toHaveLength(tokenNames.length);
        for (const name of tokenNames) {
          expect(definition[mode][name], `${theme.id}.${mode}.${name}`).toEqual(expect.any(String));
          expect(definition[mode][name]!.trim(), `${theme.id}.${mode}.${name}`).not.toBe('');
        }
      }
      expect(definition.light['color-page-bg']).not.toBe(definition.dark['color-page-bg']);
    },
  );

  it('reports all missing values with actionable context', () => {
    expect(() => validateThemeTokens({}, 'example.dark')).toThrow(/example\.dark.*missing.*color-page-bg.*color-success-fg/s);
  });

  it('rejects incompatible contract major versions', () => {
    expect(() => assertCompatibleContract('2.0.0', 'future-theme')).toThrow(/future-theme.*2\.0\.0.*major 1/s);
    expect(() => assertCompatibleContract('1.4.0', 'compatible-theme')).not.toThrow();
  });
});
