# Public API

## `@omni-ui/token-contract`

- `TOKEN_CONTRACT_VERSION`: currently `1.0.0`.
- `tokenDefinitions` / `tokenNames`: authoritative runtime descriptors.
- `definePalette(input)`: deterministic reference aliases.
- `createThemeTokens(reference, overrides?)`: composes and validates all required semantic values.
- `validateThemeTokens(values, context?)`: throws an error naming every missing token.
- `validateThemeDefinition(definition, themeId)`: validates both appearances.
- `assertCompatibleContract(actual, themeId)`: checks major-version compatibility.
- Types: `ThemePlugin`, `ThemeManifest`, `ThemeDefinition`, `TokenValues`, `ReferenceTokens`, `ColorMode`, `ModePreference`.

Machine-readable files: `contract.json` and `manifest-schema.json` are package exports. The JSON manifest schema describes serializable fields; runtime validation additionally requires the `load()` function.

## `@omni-ui/core`

### `new ThemeController(options)`

```ts
interface ThemeControllerOptions {
  root: HTMLElement;
  initialThemeId: string;
  plugins: ThemePlugin[];
  storage?: StorageLike | null; // default: safe window.localStorage access
  window?: Window | null;       // injectable for tests/nonstandard environments
  document?: Document | null;
  styleNonce?: string; // nonce for the dynamic token/color-scheme style under CSP
  rootId?: string;     // unique root ID, useful across independently bundled controllers
}
```

Methods and properties:

- `initialize(): Promise<ThemeState>` attaches media/storage listeners, validates saved state, and loads the selected plugin.
- `setTheme(id): Promise<ThemeState>` lazily loads, validates, and applies a theme. Await or catch failures.
- `setModePreference(preference): void` accepts `light`, `dark`, or `system`.
- `getState(): ThemeState` returns a copy.
- `subscribe(listener): () => void` calls immediately and on changes; invoke the returned cleanup.
- `destroy(): void` cancels pending application and removes listeners/style.

`ThemeState` contains `themeId`, `modePreference`, `resolvedMode`, `status: idle | loading | ready | error`, and `error: string | null`.

## `@omni-ui/components`

Import `@omni-ui/components/styles.css`. Markup contracts are shown in the dashboard and README.

### `DialogController`

```ts
const dialog = new DialogController(dialogElement, { onClose?: () => void });
dialog.open();
dialog.close();
dialog.destroy();
```

The native `<dialog>` must have `aria-label` or `aria-labelledby`. `open()` records the focused element, calls `showModal()`, and focuses `[autofocus]` or the first focusable control. Native Escape supplies dismissal; the `close` event restores focus when the original element remains connected.

### `TableController<T extends Record<string, unknown>>`

```ts
const table = new TableController(tableElement, {
  columns: [{ key: 'title', label: 'Task', sortable: true }, { key: 'status', label: 'Status', badge: true }],
  rows,
  emptyMessage: 'No matching tasks.',
  rowLabel: row => String(row.title),
  onEdit: row => edit(row),
});
table.setRows(nextRows);
table.destroy();
```

It uses native table headers, sort buttons, `aria-sort`, safe DOM text insertion, status badges, and an empty-state row. Sorting restores focus to the replacement heading button. Applications own filtering and persistence.

### `createNavigation(navigation, toggle, onNavigate)`

Wires buttons with `data-nav-id`, updates `aria-current="page"`, controls the panel named by the toggle's `aria-controls`, keeps `aria-expanded` synchronized, and returns an event-listener cleanup function.

## `@omni-ui/brand-rgb`

- `brandAnchors`: measured blue, sky, yellow, ink, and paper references.
- `applyBrandTheme(definition, { chroma })`: derives branded roles for both appearances without mutating the base definition.
- `recolorWithBrandHue(base, anchor, chroma)`: applies an anchor hue at the base color's OKLCH lightness.
- `hexToOklch` / `oklchToHex`: perceptual conversion with chroma-reducing sRGB gamut mapping.
- `contrast` / `fitContrast`: WCAG ratio measurement and nearest-lightness constraint solving.
- `hueDistance`: circular hue-difference measurement.

See [the brand system](brand-rgb.md) for role boundaries, personality values, and verification limits.

## Theme plugin shape

```ts
const plugin: ThemePlugin = {
  id: 'example-theme',
  name: 'Example Theme',
  version: '1.0.0',
  contractVersion: '1.0.0',
  modes: ['light', 'dark'],
  load: () => import('./tokens').then(module => module.definition),
};
```
