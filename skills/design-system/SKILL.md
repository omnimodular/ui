---
name: omni-design-system
description: Build or modify Omni UI native HTML components and standalone token themes without introducing framework or theme-specific coupling.
---

# Omni UI design system

Use this skill when adding a component, changing semantic tokens, authoring a theme, fixing theme behavior, or reviewing accessibility in this repository.

## Authoritative files

Inspect these before changing code:

- `packages/token-contract/src/contract.json`: required token names, types, meanings, and contract version.
- `packages/token-contract/src/index.ts`: palette composition and validation.
- `packages/token-contract/src/manifest-schema.json`: serializable manifest schema.
- `packages/core/src/index.ts`: identity, mode, loading, persistence, race and failure behavior.
- `packages/brand-rgb/src/` and `docs/brand-rgb.md`: measured anchors, OKLCH derivation, gamut mapping, and contrast constraints.
- `packages/components/src/styles.css`: scoped native-element styles and approved states.
- `packages/components/src/`: dialog, table, and navigation behavior controllers.
- `apps/dashboard/index.html` and `src/main.ts`: real markup and API use.
- `docs/api.md`, `docs/tokens.md`, and `docs/creating-themes.md`: public contracts and authoring details.

Reuse native elements and existing behavior before adding a controller or class. Do not create React/Svelte/Lit/custom-element wrappers just to style a native element. Use minimal classes for actual variants/layout, as in `<button class="secondary">`.

## Component workflow: settings panel example

1. Inspect the existing field, card, button, help/error, and dialog patterns in the dashboard.
2. Write semantic HTML with real labels and native controls. Consume semantic tokens for custom layout/design values.
3. Add JavaScript only for behavior not supplied by HTML. Preserve keyboard and validation semantics.
4. Test both appearances without adding a theme selector to component CSS.

A complete settings section can use the existing contract directly:

```html
<section class="card" aria-labelledby="notifications-title">
  <h2 id="notifications-title">Notifications</h2>
  <p class="help">Choose which local project updates you receive.</p>
  <form id="notification-settings">
    <label class="checkbox-field">
      <input type="checkbox" name="weekly" checked /> Weekly project summary
    </label>
    <div class="field">
      <label for="notification-email">Email</label>
      <input id="notification-email" name="email" type="email" required
        aria-describedby="notification-email-error" />
      <p class="error" id="notification-email-error" hidden>Enter a valid email address.</p>
    </div>
    <button class="primary" type="submit">Save settings</button>
    <output id="settings-status" role="status"></output>
  </form>
</section>
<script type="module">
  const form = document.querySelector('#notification-settings');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const email = form.elements.email;
    const invalid = !email.validity.valid;
    email.setAttribute('aria-invalid', String(invalid));
    document.querySelector('#notification-email-error').hidden = !invalid;
    document.querySelector('#settings-status').textContent = invalid ? '' : 'Settings saved.';
    if (invalid) email.focus();
  });
</script>
```

For application code, query elements with checked helpers and handle storage failures as `apps/dashboard/src/main.ts` does. For reusable modality, use `DialogController`; do not reimplement a focus trap around a `<div>`.

### Component rules

- Scope all selectors beneath `[data-om-theme-root]`.
- Never branch on a theme ID or import `@omni-ui/theme-*` in components/core.
- Use `--color-action-primary-bg`, not palette names or hardcoded hex colors.
- Keep brand derivation in `brand-rgb`; do not paste brand hex values into component CSS. Fixed `--brand-rgb-*` references are decorative only, never status substitutes.
- Use native `button`, `input`, `select`, `textarea`, `dialog`, `nav`, and `table` semantics.
- Preserve visible `:focus-visible`, disabled, invalid, hover, active, selected, reduced-motion, and forced-colors behavior.
- Keep media-query breakpoints static; custom properties are not valid portable media conditions.

## Standalone theme workflow: worked example

Follow the complete Moss example in `docs/creating-themes.md`:

1. Create a package depending only on `@omni-ui/token-contract`.
2. Export `light` and `dark` definitions through `createThemeTokens(definePalette(...))`. Define readable success/warning/error/info pairs and all distinctive references.
3. Export a `ThemeManifest` with unique ID, name, plugin version, contract version, and both modes.
4. Add `load: () => import('./tokens').then(module => module.definition)` to keep values lazy.
5. Register the package in the **consumer's** plugin array. Never edit core/components to recognize it.
6. Validate all tokens, contrast pairs, gallery behavior, and single-theme artifacts.

The architecture tests enforce prohibited catalog imports, hardcoded component colors, and theme-ID selectors where practical. They cannot prove visual quality, correct token meaning, or accessibility.

## Accessibility proposals

Provide evidence, not token-name assumptions:

- Measure foreground/background pairs with the actual resolved values. Normal text needs 4.5:1; applicable non-text indicators need 3:1. Account for actual state selectors such as active navigation on hover.
- For translucency, composite against the real backdrop or flag manual review. Do not assign an assumed background.
- Exercise keyboard navigation, dialog focus, validation, and responsive layouts in a real browser.
- Explain visual impact and include screenshots for spacing, typography, focus, or color changes.
- State what axe establishes and what remains unverified. A prompt, passing scan, or theme name does not guarantee accessibility.

## Validation and reporting

Run the narrowest relevant checks first, then:

```sh
npm run typecheck
npm test
npm run build
npm run test:bundle
npm run test:a11y
```

Regenerate token docs after intentional contract changes with `node scripts/generate-token-docs.mjs`. Browser checks require Chrome/Chromium (`CHROME_PATH` is supported). Report commands, pass/fail counts, and any unrun browser, assistive-technology, zoom, forced-colors, or device checks. Never convert an unverified item into a conformance claim.
