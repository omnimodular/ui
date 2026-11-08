# Creating a standalone theme

A theme owns values, not component markup. Do not edit `packages/core` or `packages/components` to add one.

## 1. Create an independent package

Use any existing directory under `packages/themes` as the structural example. Package exports are `src/index.ts` (manifest/loader) and `src/tokens.ts` (lazy values), with a dependency on `@omni-ui/token-contract`. Existing branded themes additionally compose `@omni-ui/brand-rgb`; unbranded standalone themes do not need it.

```json
{
  "name": "@example/theme-moss",
  "version": "1.0.0",
  "type": "module",
  "dependencies": { "@omni-ui/token-contract": "1.0.0" },
  "exports": { ".": "./src/index.ts", "./tokens": "./src/tokens.ts" }
}
```

## 2. Implement both complete appearances

This worked example uses deterministic aliases for secondary/input roles and explicitly defines readable status pairs. `createThemeTokens` fills all 103 contract values and throws if anything is missing.

```ts
// src/tokens.ts
import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#f3f5ef', surface: '#ffffff', raised: '#ffffff', subtle: '#e4eadc',
    text: '#1c291d', textSecondary: '#425343', textMuted: '#586959',
    border: '#a7b39f', borderStrong: '#65755e',
    primary: '#315e3b', primaryFg: '#ffffff', primaryHover: '#23482c', primaryActive: '#183521', focus: '#87500b',
    selected: '#dce8d3', selectedFg: '#294b2d',
    successBg: '#dcebd5', successFg: '#355b2a', successBorder: '#557c43',
    warningBg: '#f3e5be', warningFg: '#6d4a13', warningBorder: '#9c752c',
    errorBg: '#f1dcd2', errorFg: '#8b402c', errorBorder: '#8b402c',
    infoBg: '#dce8e4', infoFg: '#315c55', infoBorder: '#4e8076',
    radius: '8px', shadow: '0 3px 12px rgb(35 55 30 / 0.12)',
  })),
  dark: createThemeTokens(definePalette({
    page: '#151c16', surface: '#202a21', raised: '#293529', subtle: '#31402f',
    text: '#eef4e9', textSecondary: '#cedac7', textMuted: '#b5c2ad',
    border: '#64715d', borderStrong: '#a7b49e',
    primary: '#add79e', primaryFg: '#173019', primaryHover: '#c9e8bd', primaryActive: '#e0f3d7', focus: '#efbd72',
    selected: '#3c5136', selectedFg: '#f0f8e9',
    successBg: '#283d24', successFg: '#b6dca2', successBorder: '#82b56c',
    warningBg: '#44371c', warningFg: '#e8d29a', warningBorder: '#c0a05b',
    errorBg: '#472b22', errorFg: '#edb7a3', errorBorder: '#d8947b',
    infoBg: '#233c37', infoFg: '#b0d9d0', infoBorder: '#7bb5a9',
    danger: '#d8947b', dangerFg: '#35170e', dangerHover: '#edb7a3',
    radius: '8px', shadow: '0 4px 16px rgb(0 0 0 / 0.3)',
  })),
};
```

Fonts must use local/system stacks or bundled assets with compatible licenses and attribution. Keep text surfaces opaque. If translucent decoration is added, document its actual composited background and provide an opaque alternative.

## 3. Export the typed manifest and lazy loader

```ts
// src/index.ts
import type { ThemeManifest, ThemePlugin } from '@omni-ui/token-contract';

export const manifest: ThemeManifest = {
  id: 'moss',
  name: 'Moss',
  version: '1.0.0',
  contractVersion: '1.0.0',
  modes: ['light', 'dark'],
};

export const theme: ThemePlugin = {
  ...manifest,
  load: () => import('./tokens').then(module => module.definition),
};
export default theme;
```

The JSON schema is `@omni-ui/token-contract/manifest-schema.json`. The controller enforces unique lowercase IDs, required fields, both modes, and compatible contract majors. Token validation occurs after every load, before DOM changes.

## 4. Register at the application boundary

```ts
import moss from '@example/theme-moss';

const controller = new ThemeController({
  root: document.body,
  initialThemeId: 'moss',
  plugins: [moss], // add other independently imported plugins when desired
});
await controller.initialize();
```

A gallery adds the manifest to its own catalog, as in `apps/dashboard/src/themes.ts`. Core and component files remain untouched. A single-theme app imports only `moss`.

## 5. Verify

```sh
npm run typecheck
npm test
npm run build
npm run test:bundle
npm run test:a11y
node scripts/generate-token-docs.mjs # only after intentional contract changes
```

Add the new package to the dashboard catalog and `tests/accessibility.mjs` only if it is intentionally becoming a gallery theme. Add token/behavior fixtures for failure cases. Inspect emitted chunks to confirm lazy loading. For visual changes, include contrast measurements and desktop/mobile screenshots. Automated checks do not establish screen-reader usability or full WCAG conformance.
