import type { ColorMode, ThemeDefinition, TokenValues } from '@omni-ui/token-contract';
import { contrast, fitContrast, hexToOklch, oklchToHex, type Oklch } from './color';

export { contrast, fitContrast, hexToOklch, hueDistance, oklchToHex } from './color';
export type { Oklch } from './color';

export const brandAnchors = Object.freeze({
  blue: '#1790dd',
  sky: '#90d7fd',
  yellow: '#fdef6d',
  ink: '#000000',
  paper: '#ffffff',
});

export interface BrandPersonality {
  /** Multiplies brand chroma while retaining the same anchor hue. */
  chroma: number;
}

function brandedColor(base: string, anchor: Oklch, chroma: number, useAnchorLightness = false): Oklch {
  const current = hexToOklch(base);
  return {
    l: useAnchorLightness ? anchor.l : current.l,
    c: Math.min(anchor.c * chroma, 0.32),
    h: anchor.h,
  };
}

function shiftLightness(color: Oklch, amount: number): Oklch {
  // Avoid washing interaction states out to near-zero chroma at the white/black poles.
  return { ...color, l: Math.min(0.96, Math.max(0.04, color.l + amount)) };
}

function deriveTheme(tokens: TokenValues, mode: ColorMode, personality: BrandPersonality): TokenValues {
  const blue = hexToOklch(brandAnchors.blue);
  const sky = hexToOklch(brandAnchors.sky);
  const primaryFg = tokens['color-action-primary-fg']!;
  const surface = tokens['color-surface-bg']!;
  const page = tokens['color-page-bg']!;
  const originalPrimary = hexToOklch(tokens['color-action-primary-bg']!);
  const primarySeed = brandedColor(tokens['color-action-primary-bg']!, blue, personality.chroma, mode === 'light');
  if (mode === 'dark') primarySeed.l = Math.max(primarySeed.l, originalPrimary.l);
  const primary = fitContrast(primarySeed, [primaryFg], 4.5);
  const primaryOklch = hexToOklch(primary);
  const lightForeground = contrast(primary, '#ffffff') >= contrast(primary, '#000000');
  const direction = lightForeground ? -1 : 1;
  const hover = fitContrast(shiftLightness(primaryOklch, 0.07 * direction), [primaryFg], 4.5);
  const active = fitContrast(shiftLightness(primaryOklch, 0.13 * direction), [primaryFg], 4.5);

  const link = fitContrast(brandedColor(tokens['color-link']!, blue, personality.chroma, true), [surface, page], 4.5);
  const linkOklch = hexToOklch(link);
  const linkDirection = luminanceForDirection(link, surface);
  const linkHover = fitContrast(shiftLightness(linkOklch, 0.09 * linkDirection), [surface, page], 4.5);
  const focus = fitContrast(brandedColor(tokens['color-focus-ring']!, sky, Math.max(0.8, personality.chroma), true), [surface, page], 3);

  const infoSeed = brandedColor(tokens['color-info-bg']!, sky, personality.chroma);
  const infoBg = fitContrast(infoSeed, [tokens['color-info-fg']!], 4.5);
  const infoBorder = fitContrast(brandedColor(tokens['color-info-border']!, blue, personality.chroma), [infoBg], 3);
  const selectedSeed = brandedColor(tokens['color-selected-bg']!, sky, personality.chroma);
  const selectedBg = fitContrast(selectedSeed, [tokens['color-selected-fg']!], 4.5);

  return {
    ...tokens,
    'color-action-primary-bg': primary,
    'color-action-primary-hover': hover,
    'color-action-primary-active': active,
    'color-link': link,
    'color-link-hover': linkHover,
    'color-focus-ring': focus,
    'color-info-bg': infoBg,
    'color-info-border': infoBorder,
    'color-selected-bg': selectedBg,
  };
}

function luminanceForDirection(color: string, background: string): number {
  return contrast(color, '#ffffff') >= contrast(background, '#ffffff') ? -1 : 1;
}

/** Applies brand roles without changing theme neutrals, typography, shape, motion, or status meanings. */
export function applyBrandTheme(definition: ThemeDefinition, personality: BrandPersonality): ThemeDefinition {
  if (!Number.isFinite(personality.chroma) || personality.chroma <= 0) {
    throw new Error('[brand-rgb] Personality chroma must be a positive finite number.');
  }
  return {
    light: deriveTheme(definition.light, 'light', personality),
    dark: deriveTheme(definition.dark, 'dark', personality),
  };
}

/** Useful for authoring tools and tests; returns a new color without mutating either input. */
export function recolorWithBrandHue(base: string, anchor: string, chroma: number): string {
  return oklchToHex(brandedColor(base, hexToOklch(anchor), chroma));
}
