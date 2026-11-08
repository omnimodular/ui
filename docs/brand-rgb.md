# Scientific RGB brand system

`@omni-ui/brand-rgb` applies Omnimodular's recognizable color relationships without replacing every theme with the same palette. It is an authoring/runtime composition library inside each lazy theme loader; core, components, and the token contract have no brand-specific branches.

## Measured anchors

The dominant opaque colors extracted from the public homepage logo are:

| Reference | Hex | Approximate OKLCH |
| --- | --- | --- |
| Blue | `#1790DD` | `0.630 0.151 244.5°` |
| Sky | `#90D7FD` | `0.846 0.089 232.6°` |
| Yellow | `#FDEF6D` | `0.939 0.150 103.2°` |
| Ink | `#000000` | `0 0 0°` |
| Paper | `#FFFFFF` | `1 0 89.9°` |

`brandAnchors` is the executable source of truth. `styles.css` exposes the same values as decorative `--brand-rgb-*` references under the theme root. The dashboard brand mark uses the fixed blue/yellow/ink signature. Decorative references are not semantic status colors.

## Transformation model

Colors are converted from sRGB to OKLCH. Each derived color starts with a selected anchor hue and a theme-specific chroma multiplier. The compiler then:

1. Preserves or adjusts lightness according to the role and color mode.
2. Resolves foreground/background pairs together at 4.5:1 for normal text and 3:1 for applicable indicators.
3. Finds the nearest lightness satisfying every required background for that role.
4. Reduces chroma in OKLCH until the color fits sRGB, rather than clipping individual RGB channels.
5. Limits interaction states before the black/white poles so they do not become chroma-free by accident.
6. Emits deterministic six-digit hex values consumed by the unchanged semantic token contract.

The yellow anchor is intentionally decorative: it passes with dark ink but not white text. It is not substituted for warning, selected, or action semantics.

## Branded roles and preserved identity

| Roles | Treatment |
| --- | --- |
| Primary action background, hover, active | Brand-blue hue; contrast solved against the theme's action foreground |
| Links and link hover | Brand-blue hue; contrast solved against both page and surface |
| Focus ring | Brand-sky hue; at least 3:1 against page and surface |
| Info background/border | Brand-sky/blue hues while retaining the theme's info foreground |
| Selected background | Brand-sky hue while retaining the theme's selected foreground |
| Pages, surfaces, neutrals, text hierarchy | Preserved from the theme |
| Success, warning, error roles | Preserved from the theme |
| Secondary and destructive actions | Preserved from the theme |
| Typography, spacing, shape, shadow, motion | Preserved from the theme |

## Chroma personalities

The multiplier changes saturation, not the shared hue relationship:

| Theme | Multiplier |
| --- | ---: |
| Minimalist Nordic | 0.55 |
| Enterprise Slate | 0.45 |
| Cyberpunk Neon | 1.20 |
| High-Contrast Clarity | 1.00 |
| Pastel Soft | 0.45 |
| Editorial Serif | 0.40 |
| Botanical Earth | 0.50 |
| Ocean Glass | 0.80 |
| Retro Terminal | 0.55 |
| Playful Geometric | 0.95 |

These values are authored inputs, not accessibility claims. The final emitted values—not the multiplier—are validated.

## Use in a theme

```ts
import { applyBrandTheme } from '@omni-ui/brand-rgb';

export const theme: ThemePlugin = {
  ...manifest,
  load: () => import('./tokens').then(module =>
    applyBrandTheme(module.definition, { chroma: 0.55 })
  ),
};
```

The base token module remains independently inspectable. `applyBrandTheme` does not mutate it and returns the same result for the same inputs. A theme that should not use the brand system can export its base definition directly.

## Public utilities

- `brandAnchors`: fixed measured references.
- `applyBrandTheme(definition, personality)`: derives both appearances.
- `recolorWithBrandHue(base, anchor, chroma)`: authoring utility for individual colors.
- `hexToOklch` / `oklchToHex`: conversion and chroma-reducing sRGB gamut mapping.
- `contrast` / `fitContrast`: measured WCAG ratios and nearest-lightness solving.
- `hueDistance`: circular hue comparison.

## Verification and limits

`tests/brand-rgb.test.ts` verifies anchor coordinates, round trips, deterministic output, input immutability, preserved personality, gamut-mapped hue relationships, and required contrast for every theme/mode. Hue assertions allow up to 3° for eight-bit quantization and skip effectively achromatic values below 0.01 chroma; hue is not meaningful at the white/black poles. Existing contract and contrast suites validate all emitted values, and real-browser axe scans validate rendered states.

OKLCH improves color manipulation but does not itself prove accessibility, display calibration, color-vision accessibility, or brand recognition. P3/native display adapters, perceptual brand-recognition studies, and physical-device evaluation remain separate work. The current output intentionally targets portable sRGB hex rather than runtime `color-mix()`.
