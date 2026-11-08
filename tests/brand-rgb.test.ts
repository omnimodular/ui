import { describe, expect, it } from 'vitest';
import {
  applyBrandTheme, brandAnchors, contrast, hexToOklch, hueDistance, oklchToHex, recolorWithBrandHue,
} from '@omni-ui/brand-rgb';
import { themes } from '../apps/dashboard/src/themes';
import { definition as rawNordic } from '@omni-ui/theme-minimalist-nordic/tokens';

describe('scientific RGB brand compiler', () => {
  it('uses measured brand anchors with stable OKLCH coordinates', () => {
    expect(hexToOklch(brandAnchors.blue).l).toBeCloseTo(0.630, 2);
    expect(hexToOklch(brandAnchors.blue).c).toBeCloseTo(0.151, 2);
    expect(hexToOklch(brandAnchors.blue).h).toBeCloseTo(244.5, 1);
    expect(hexToOklch(brandAnchors.sky).h).toBeCloseTo(232.6, 1);
    expect(hexToOklch(brandAnchors.yellow).h).toBeCloseTo(103.2, 1);
  });

  it('round-trips anchors and gamut-maps without RGB channel clipping', () => {
    for (const anchor of Object.values(brandAnchors)) expect(oklchToHex(hexToOklch(anchor))).toBe(anchor);
    const mapped = recolorWithBrandHue('#808080', brandAnchors.blue, 2);
    expect(mapped).toMatch(/^#[0-9a-f]{6}$/);
    expect(hueDistance(hexToOklch(mapped).h, hexToOklch(brandAnchors.blue).h)).toBeLessThan(1.5);
    expect(hexToOklch(mapped).l).toBeCloseTo(hexToOklch('#808080').l, 2);
  });

  it('does not use the light brand yellow incorrectly with white text', () => {
    expect(contrast(brandAnchors.yellow, brandAnchors.ink)).toBeGreaterThan(4.5);
    expect(contrast(brandAnchors.yellow, brandAnchors.paper)).toBeLessThan(4.5);
  });

  it('is deterministic and preserves the unbranded input', async () => {
    const before = structuredClone(rawNordic);
    const first = applyBrandTheme(rawNordic, { chroma: 0.55 });
    const second = applyBrandTheme(rawNordic, { chroma: 0.55 });
    expect(first).toEqual(second);
    expect(rawNordic).toEqual(before);
    expect(first.light['color-page-bg']).toBe(rawNordic.light['color-page-bg']);
    expect(first.light['color-success-bg']).toBe(rawNordic.light['color-success-bg']);
    expect(first.light['color-action-primary-bg']).not.toBe(rawNordic.light['color-action-primary-bg']);
    expect(await themes.find((theme) => theme.id === 'minimalist-nordic')!.load()).toEqual(first);
  });

  it('retains chroma personality instead of flattening every theme to one palette', async () => {
    const nordic = await themes.find((theme) => theme.id === 'minimalist-nordic')!.load();
    const cyber = await themes.find((theme) => theme.id === 'cyberpunk-neon')!.load();
    expect(hexToOklch(cyber.light['color-selected-bg']!).c).toBeGreaterThan(hexToOklch(nordic.light['color-selected-bg']!).c);
    expect(cyber.light['font-family-heading']).not.toBe(nordic.light['font-family-heading']);
    expect(cyber.light['color-page-bg']).not.toBe(nordic.light['color-page-bg']);
  });

  it.each(themes.map((theme) => [theme.id, theme] as const))('%s preserves brand hues and semantic invariants', async (_id, theme) => {
    const definition = await theme.load();
    const blueHue = hexToOklch(brandAnchors.blue).h;
    const skyHue = hexToOklch(brandAnchors.sky).h;
    for (const mode of ['light', 'dark'] as const) {
      const tokens = definition[mode];
      for (const role of ['color-action-primary-bg', 'color-action-primary-hover', 'color-action-primary-active', 'color-link', 'color-link-hover', 'color-info-border']) {
        const color = hexToOklch(tokens[role]!);
        if (color.c >= 0.01) expect(hueDistance(color.h, blueHue), `${theme.id}.${mode}.${role}`).toBeLessThan(3);
      }
      for (const role of ['color-focus-ring', 'color-info-bg', 'color-selected-bg']) {
        const color = hexToOklch(tokens[role]!);
        if (color.c >= 0.01) expect(hueDistance(color.h, skyHue), `${theme.id}.${mode}.${role}`).toBeLessThan(3);
      }
      expect(contrast(tokens['color-action-primary-fg']!, tokens['color-action-primary-bg']!)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(tokens['color-focus-ring']!, tokens['color-surface-bg']!)).toBeGreaterThanOrEqual(3);
    }
  });
});
