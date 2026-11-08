import { describe, expect, it } from 'vitest';
import { themes } from '../apps/dashboard/src/themes';
import type { ColorMode, TokenValues } from '@omni-ui/token-contract';

function channels(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Contrast test requires an opaque six-digit color, received ${hex}`);
  return [0, 2, 4].map((offset) => Number.parseInt(match[1]!.slice(offset, offset + 2), 16)) as [number, number, number];
}
export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}
const textPairs: [string, string][] = [
  ['color-text-primary', 'color-page-bg'], ['color-text-primary', 'color-surface-bg'], ['color-text-primary', 'color-surface-raised'],
  ['color-text-secondary', 'color-surface-bg'], ['color-text-muted', 'color-surface-bg'], ['color-link', 'color-surface-bg'],
  ['color-action-primary-fg', 'color-action-primary-bg'], ['color-action-primary-fg', 'color-action-primary-hover'], ['color-action-primary-fg', 'color-action-primary-active'],
  ['color-action-secondary-fg', 'color-action-secondary-bg'], ['color-action-secondary-fg', 'color-action-secondary-hover'], ['color-action-secondary-fg', 'color-action-secondary-active'],
  ['color-action-destructive-fg', 'color-action-destructive-bg'], ['color-action-destructive-fg', 'color-action-destructive-hover'],
  ['color-selected-fg', 'color-selected-bg'], ['color-input-fg', 'color-input-bg'], ['color-input-placeholder', 'color-input-bg'],
  ['color-invalid', 'color-surface-bg'],
  ...['success', 'warning', 'error', 'info'].flatMap((status): [string, string][] => [[`color-${status}-fg`, `color-${status}-bg`]]),
];
const nonTextPairs: [string, string][] = [
  ['color-input-border', 'color-input-bg'], ['color-action-secondary-border', 'color-surface-bg'], ['color-focus-ring', 'color-page-bg'], ['color-focus-ring', 'color-surface-bg'],
];

function checkPairs(tokens: TokenValues, pairs: [string, string][], threshold: number, label: string, mode: ColorMode) {
  const failures = pairs.flatMap(([foreground, background]) => {
    const ratio = contrast(tokens[foreground]!, tokens[background]!);
    return ratio >= threshold ? [] : [`${foreground} on ${background}: ${ratio.toFixed(2)}:1`];
  });
  expect(failures, `${label}.${mode}\n${failures.join('\n')}`).toEqual([]);
}

describe('measured WCAG contrast pairs', () => {
  it.each(themes.map((theme) => [theme.id, theme] as const))('%s documented pairs', async (_id, theme) => {
    const definition = await theme.load();
    for (const mode of ['light', 'dark'] as const) {
      checkPairs(definition[mode], textPairs, 4.5, theme.id, mode);
      checkPairs(definition[mode], nonTextPairs, 3, theme.id, mode);
    }
  });
});
