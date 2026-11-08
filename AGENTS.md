# Omni UI agent notes

This repository intentionally uses native HTML, scoped CSS, and framework-free TypeScript. Do not introduce an application framework or custom-element wrappers for native controls.

- Component markup: `apps/dashboard/index.html`.
- Scoped component CSS: `packages/components/src/styles.css`.
- DOM behavior: `packages/components/src/*.ts`.
- Theme controller: `packages/core/src/index.ts`.
- Brand derivation: `packages/brand-rgb/src/` and `docs/brand-rgb.md`.
- Token source of truth: `packages/token-contract/src/contract.json`.
- Standalone themes: `packages/themes/*/src/{index,tokens}.ts`.
- Agent authoring guide: `skills/design-system/SKILL.md`.

Core/components must not import the theme catalog. Every theme needs every token in light and dark. Theme selectors stay under `[data-om-theme-root]`. Use semantic tokens, not hardcoded colors or theme-specific component branches. Brand values belong in `brand-rgb`; preserve theme neutrals and status meanings when changing brand derivation.

Run `npm run check` for full verification. Regenerate `docs/tokens.md` after contract changes. Update this file if package boundaries, commands, or source-of-truth paths change.
