# Contributing

## Ground rules

- Keep native HTML semantics and behavior identical across themes.
- Put design choices in semantic tokens, not per-theme component selectors or hardcoded colors.
- Change RGB brand behavior only in `brand-rgb`; retain measured anchors, preserve status meanings, and test the emitted colors rather than assuming OKLCH guarantees contrast.
- Do not import the theme catalog from core or components.
- Preserve both light and dark appearances and verify system mode.
- Add focused tests for behavior changes. Do not weaken tests to hide a regression.
- Keep third-party assets optional, licensed, and attributed. The repository currently bundles no external fonts or artwork.

Start with [skills/design-system/SKILL.md](skills/design-system/SKILL.md) and the authoritative files it lists.

## Development

```sh
npm ci
npm run dev
npm run check
```

For browser checks, set `CHROME_PATH` or run `npx playwright install chromium`. Report exactly which checks ran. If browser, assistive-technology, or manual platform verification was not possible, say so.

## Token versioning

The token contract and plugins use semantic versioning independently:

- **Patch:** documentation, descriptions, or corrections that do not change runtime requirements.
- **Minor:** backward-compatible optional metadata or a new optional capability. Existing themes still resolve.
- **Major:** adding a required token, removing/renaming a token, changing a token's meaning/type, or changing required manifest behavior.

Theme packages declare their compatible contract version. Runtime accepts the same major; a major mismatch fails with migration guidance. Do not repurpose an existing semantic role to avoid a major release. Theme visual value changes use the theme package's own version and do not change the contract version.

## Adding a theme

Follow [docs/creating-themes.md](docs/creating-themes.md). Exactly the ten requested catalog themes are in the demo; additional themes should first be standalone consumer fixtures unless expanding the catalog is an explicit goal. Every contributed catalog theme needs both modes, measured contrast, lazy loading, and bundle verification.

## Accessibility review

Run token-pair tests and real-browser axe scans, then manually inspect focus order, keyboard-only task editing, zoom/reflow, reduced motion, and forced colors. Include measured ratios and screenshots for visual changes. Automated checks establish specific facts; they do not certify WCAG conformance or replace assistive-technology review.
