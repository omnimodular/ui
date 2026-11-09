# Omni UI

A framework-free design system built from **native HTML, scoped CSS custom properties, and small TypeScript behavior controllers**. Ten independently importable themes share one component implementation.

**[Open the live demo](https://omnimodular.github.io/ui/)** — explore all ten themes, top navigation, and the optional collapsible sidebar.

No React, Svelte, Vue, Lit, Tailwind, HTMX, runtime CSS-in-JS, web fonts, backend, or authentication is required.

## Design intent and authorship

**Designed by AI (Kimi K3.1 Pro), with goals, constraints, and direction set by humans.**

This code was created for Omnimodular's internal UI tooling. It is also intended for hardware, backend, and other non-UI specialists who need a simple, elegant, off-the-shelf UI template without committing to React or a similarly heavyweight application framework. The public API is ordinary HTML, CSS custom properties, DOM events, and small TypeScript modules, so it can be reused from almost any web stack.

## Run it

Requirements: Node.js 20.19+ (22 recommended) and npm 10+.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The dashboard includes local project tasks, search/filter/sort, create/edit validation, native modal dialogs, a component showcase, interactive API examples, all ten themes, and Light/Dark/System controls.

Tasks and appearance preferences persist in browser local storage. If storage is unavailable or invalid, the demo remains usable and reports the problem; task changes then last only for the current session. Use **Clear site data** to restore the original eight tasks.

## GitHub Pages deployment

The CI workflow publishes the dashboard to [GitHub Pages](https://omnimodular.github.io/ui/) after verification succeeds on `master`. Pull requests run checks without deploying. The workflow can also be started manually on `master`.

Pages must use **GitHub Actions** as its publishing source. The deployment builds only `apps/dashboard/dist` with Vite's `/ui/` base path, verifies that output in a browser, and uploads it as a Pages artifact. No Node server runs on Pages; tasks and preferences remain in each visitor's browser. Normal local builds keep the default `/` base path.

To reproduce the deployment build and smoke test locally:

```sh
npm run build --workspace @omni-ui/dashboard -- --base /ui/
node tests/pages-smoke.mjs
```

## Verify

```sh
npm run typecheck     # strict TypeScript
npm test              # contracts, behavior, races, contrast, architecture
npm run build         # gallery and single-theme production builds
npm run test:bundle   # inspect the single-theme artifacts
npm run test:a11y     # real-browser axe scans and interaction checks
npm run check         # all of the above
```

`test:a11y` uses an installed Chrome/Chromium when found. Set `CHROME_PATH=/path/to/chrome`, or install Playwright's browser with `npx playwright install chromium`. Reports and screenshots are written to `artifacts/` (not committed). The browser script runs 100 axe scans: dashboard, top navigation, folded navigation, component showcase, and dialog in each of 20 theme/mode combinations. Automated scans do not prove complete WCAG conformance.

## Repository map

```text
packages/
  token-contract/       Versioned JSON contract, schemas, token composition/validation
  core/                 Framework-free ThemeController
  components/           Native-element CSS and DOM behavior controllers
  brand-rgb/            OKLCH brand compiler, gamut mapping, contrast solver
  themes/               Ten standalone lazy theme plugins
apps/
  dashboard/            Gallery and functional project dashboard
  single-theme-fixture/ Production isolation consumer
skills/design-system/   Agent authoring guidance
docs/                   Architecture, tokens, authoring, accessibility, API
scripts/                Repository utilities
tests/                  Unit, contrast, architecture, browser and bundle checks
```

## Consume native HTML components

Import the stylesheet once and put `data-om-theme-root` on the intended root. The controller adds this attribute automatically. Component selectors never match outside that root.

```html
<button class="primary">Save</button>
<button class="secondary">Cancel</button>
<button class="destructive">Delete</button>
<button aria-busy="true">Loading</button>
<button disabled>Unavailable</button>

<article class="card">
  <span class="badge done">Done</span>
  <h2>Native HTML</h2>
</article>

<div class="field">
  <label for="email">Email</label>
  <input id="email" type="email" aria-describedby="email-help" />
  <p class="help" id="email-help">We only use this for project updates.</p>
</div>
```

Classes are limited to meaningful variants and layout (`primary`, `secondary`, `card`, `field`, and similar). There are no custom elements to upgrade. Applications own their HTML, so they can render it with any server template or client framework.

Import behavior only when needed:

```ts
import { DialogController, TableController, createNavigation } from '@omni-ui/components';

const dialogs = new DialogController(document.querySelector('dialog')!);
dialogs.open();
// dialogs.close(); dialogs.destroy();
```

See [public API documentation](docs/api.md) for table and navigation contracts.

The template supports a left sidebar or horizontal top menu, with optional sidebar folding into an icon rail. Try the gallery's Menu layout and Allow sidebar folding controls. Integrations configure the fourth argument to `createNavigation`; navigation preferences are not automatically persisted.

## Single-theme application

```ts
import '@omni-ui/components/styles.css';
import { ThemeController } from '@omni-ui/core';
import nordic from '@omni-ui/theme-minimalist-nordic';

const themes = new ThemeController({
  root: document.body,
  initialThemeId: 'minimalist-nordic',
  plugins: [nordic],
});

await themes.initialize();
themes.setModePreference('system');
```

Only Nordic is referenced by this module graph. `apps/single-theme-fixture` is a runnable production example, and `npm run test:bundle` fails if any other theme ID appears in its built artifacts.

## Gallery application

Register all ten manifests explicitly in [apps/dashboard/src/themes.ts](apps/dashboard/src/themes.ts). Each manifest is small; its token module is behind `load()` and becomes a separate production chunk.

```ts
await themes.setTheme('ocean-glass');
themes.setModePreference('dark'); // or 'light' / 'system'
```

The gallery deployment contains all ten chunks, but the browser initially fetches only the active theme. Selecting an identity loads it on demand. A failed load preserves the last successfully applied identity and exposes `state.error`; it never silently substitutes another theme.

## Styling your own HTML

Consume roles, not palette names:

```css
.project-metric {
  background: var(--color-surface-bg);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
```

The complete contract is [packages/token-contract/src/contract.json](packages/token-contract/src/contract.json). See [tokens](docs/tokens.md), [architecture](docs/architecture.md), [creating themes](docs/creating-themes.md), and the [scientific RGB brand system](docs/brand-rgb.md).

The brand compiler derives action, link, focus, info, and selected roles from measured Omnimodular blue/sky/yellow anchors in OKLCH. It preserves each theme's neutrals, typography, geometry, motion, and status meanings while enforcing contrast and portable sRGB output.

## Early initialization and SSR

Core imports do not read browser globals at module evaluation, so server-side module graphs can import them safely. Construct `ThemeController` only with a real DOM root. The dashboard loads `public/early-theme.js` before its module bundle to validate stored state and set early identity/mode attributes. External `early-theme.css` applies the matching `color-scheme` without inline style attributes; `main.ts` then awaits the persisted theme asset before revealing the app. This trades a brief loading message for no incorrect-theme flash.

For a nonce-based CSP, pass the response's per-request nonce to `styleNonce`. The controller puts both token declarations and `color-scheme` in that authorized style element—no inline style attribute is required:

```ts
const themes = new ThemeController({ root, initialThemeId, plugins, styleNonce: responseCspNonce });
```

The early script and styles are external, so they work with normal script/style source policies and do not need inline-script hashes. Production CSP must permit the script/style chunks and any configured connection sources; do not hardcode a shared nonce in a static deployment. No network fonts are used. Server-rendered applications should render the loading shell and run equivalent early code before their app HTML; the controller itself is not an SSR renderer.

## Responsive and platform scope

The demo has desktop and mobile layouts. Media queries use supported static breakpoints (1100px and 760px), not custom properties in media conditions. Reduced-motion and forced-colors rules are included. Native mobile and desktop wrappers are future adapters; CSS does not imply native platform support.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [skills/design-system/SKILL.md](skills/design-system/SKILL.md). Contract changes use semantic versioning; adding a required token is a major change.

MIT licensed. No third-party art or font binaries are bundled. Runtime/build dependencies retain their own licenses in their packages.
