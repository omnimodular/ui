# Build a Pluggable Design System and Theme Library

Act as a senior design systems engineer and frontend architect. Build a working, open-source-ready design system that unifies web product interfaces through a shared component contract and independently distributable themes.

Deliver a runnable implementation, documentation, and verification—not just a proposal or disconnected code snippets. The architecture diagram and documentation must describe the system you actually build.

## 1. Working approach

- Inspect the repository and read its root README and applicable agent instructions before making changes. Preserve existing conventions and unrelated work.
- If a suitable stack already exists, use it. For an empty repository, use TypeScript, React, Vite, and a workspace package manager. Keep the token contract and theme controller independent of React so other web frameworks can adopt them.
- State material assumptions briefly and proceed with reasonable defaults. Ask questions only when missing information prevents a correct implementation.
- Build and verify incrementally. Do not leave placeholders, incomplete theme definitions, or pseudocode in required deliverables.
- Treat native mobile and desktop integrations as future adapters; do not claim that CSS alone provides native platform support.

## 2. Architecture and package boundaries

Separate the system into four independently understandable layers:

1. **Token contract:** a versioned, machine-readable definition of required tokens, their types, meanings, and usage rules.
2. **Core engine:** a framework-independent controller for theme identity, color mode, persistence, and theme loading.
3. **Components:** reusable UI elements that consume semantic tokens and contain no theme-specific branches.
4. **Theme plugins:** independently importable packages implementing the token contract for both light and dark appearances.

The dependency direction must prevent core and component packages from importing the theme catalog. New themes must be registerable without editing core or component source files.

Support both distribution paths:

- **Single-theme application:** explicitly imports one theme; its production output contains no assets or definitions from the other nine themes.
- **Theme gallery application:** explicitly registers all ten themes and loads a selected theme on demand. Keep unselected theme CSS out of the initial load. Explain that the gallery's deployment can contain all theme chunks even though the browser loads them selectively.

Provide a typed plugin manifest with a unique ID, display name, plugin version, token-contract version, supported modes, and asset loader or equivalent registration mechanism. Validate missing tokens, duplicate IDs, and incompatible contract versions with actionable errors.

Keep theme selectors scoped to a designated theme root. Avoid global CSS leakage, overlapping active theme rules, and race conditions when users switch themes rapidly. Define behavior when a theme fails to load; preserve the last successfully applied theme and expose the failure without silently substituting another identity.

## 3. Design token contract

Use CSS custom properties as the runtime interface. Define reference tokens where useful, but expose semantic tokens for component consumption. A component should use a role such as `--color-action-primary-bg`, not a palette name such as `--blue-600`.

Cover at least:

- Colors: page and surface backgrounds, elevated surfaces, text hierarchy, inverse text, borders, links, primary and secondary actions, focus indicators, and success/warning/error/info roles.
- Interaction states: hover, active, selected, disabled, invalid, and focus-visible, including suitable foreground/background pairs.
- Typography: font families, sizes, weights, line heights, and letter spacing.
- Layout: spacing scale, control sizes, content widths, and responsive layout guidance.
- Shape and depth: border widths, radii, shadows, and overlay layering.
- Motion: durations and easing, with reduced-motion behavior.

Document token names, types, intended uses, defaults, and which tokens may differ by color mode. Include all required values for each theme through explicit definitions or deterministic composition; validate the resolved result. Do not allow missing required tokens to become accidental browser defaults.

Use tokens for design choices. Structural CSS values such as `display: flex` or `width: 100%` do not need artificial tokens. Do not rely on CSS custom properties directly inside media-query conditions; use a supported breakpoint strategy and document it.

## 4. Theme identity and color mode

Model theme identity and color mode as separate state:

- `themeId`: the selected visual identity.
- `modePreference`: `light`, `dark`, or `system`.
- `resolvedMode`: `light` or `dark`, derived from the preference and operating-system setting.

Every theme must support light and dark appearances. System mode must respond to operating-system changes while active and stop overriding an explicit user preference.

Implement initialization, updates, subscription cleanup, and persistence. Validate stored preferences, handle unavailable browser storage, and synchronize changes across tabs where supported. Keep browser globals out of module initialization so importing core does not break server rendering.

Provide an early initialization strategy to avoid an incorrect-theme flash, including an explicit policy for loading persisted theme assets. Explain any server-rendering or content-security-policy integration requirements. Apply the appropriate `color-scheme` so native controls match the resolved appearance.

## 5. Reusable components

Implement at least:

- Buttons: primary, secondary, destructive, loading, and disabled states.
- Inputs: text field, textarea, select, checkbox, labels, help text, and validation feedback.
- Cards and status badges.
- Navigation with active states and a responsive mobile presentation.
- Modal dialog with accessible naming, focus management, Escape dismissal, and focus restoration.
- A data table with sorting and an empty state.
- The theme and color-mode controls used by the demo.

Use semantic HTML and accessible interaction patterns. Mature accessible primitives are acceptable; document dependencies and style them through the token contract. Avoid hardcoded theme colors, inaccessible custom controls, and per-theme component implementations.

## 6. Ten complete theme plugins

Implement exactly these ten themes, each with a complete light and dark appearance:

| Theme | Visual direction |
| --- | --- |
| Minimalist Nordic | Airy spacing, restrained cool neutrals, simple geometry |
| Enterprise Slate | Compact professional layouts, slate surfaces, restrained blue accents |
| Cyberpunk Neon | Vivid accents, angular shapes, controlled glow effects |
| High-Contrast Clarity | Strong contrast, clear boundaries, prominent focus indicators |
| Pastel Soft | Muted pastel surfaces, rounded shapes, gentle elevation |
| Editorial Serif | Serif headings, readable body text, paper-inspired surfaces |
| Botanical Earth | Forest and clay accents, warm neutrals, organic softness |
| Ocean Glass | Marine colors, layered surfaces, optional translucent effects |
| Retro Terminal | Monospace typography, crisp borders, terminal-inspired accents |
| Playful Geometric | Bold accents, expressive shapes, energetic but restrained motion |

Make the themes visibly distinct through typography, density, shape, borders, and elevation as well as color. Preserve component structure and behavior across all themes. Provide opaque surface alternatives where transparency would undermine legibility or browser support. Avoid network-dependent fonts unless they are optional and have documented fallbacks and licenses.

The high-contrast theme is an additional visual identity, not a substitute for accessibility in the other nine themes.

## 7. Functional demonstration product

Build a responsive project management dashboard using the shared components and realistic local sample data. Include:

- Sidebar navigation, project summary cards, a searchable and filterable task table, and status badges.
- A task creation or editing dialog that validates input and updates visible local state.
- Theme selection and independent Light/Dark/System controls, including an indication of the resolved mode.
- A component showcase exposing meaningful interaction and validation states.
- Interactive code examples for registering a theme, changing identity, changing mode preference, and consuming semantic tokens in a component. Keep displayed examples consistent with the public API.

Verify desktop and mobile layouts. All primary controls must work; do not use decorative buttons that imply unimplemented behavior. No backend or authentication is required. State whether demo data persists across reloads.

## 8. Agent skill and machine-readable guidance

Create an agent skill at `skills/design-system/SKILL.md`, accompanied by a machine-readable token contract and theme manifest schema.

The skill must explain:

- When to use it and which repository files are authoritative.
- How to inspect the active contract and reuse existing components before creating new ones.
- How to build components using semantic tokens and approved interaction patterns.
- How to add a standalone theme, validate its manifest, and implement both appearances.
- How to propose accessibility improvements with measured evidence and explain their visual impact.
- Which validation commands to run and how to report failures or unverified behavior.

Include one worked example of building a settings panel and one of adding a theme. Add enforceable checks for prohibited theme-specific styling where practical. Do not claim that a prompt alone guarantees compatibility or accessibility; explain what automated checks establish and what still needs human review.

## 9. Accessibility and verification

Target WCAG 2.2 AA for the implemented demo and components. Measure relevant text contrast and non-text contrast for required states, respecting the actual criteria and their exceptions. Never infer compliance from token names or a theme's appearance.

Provide focused automated checks for:

- Token and manifest completeness across all ten themes and both appearances.
- Theme registration, mode resolution, preference persistence, system changes, and listener cleanup.
- Invalid saved preferences, unavailable storage, failed theme loads, and rapid switching.
- Keyboard navigation and dialog focus behavior.
- Contrast of documented foreground/background pairs, with translucent surfaces evaluated against their actual background or flagged for manual review.
- Production bundle isolation using a single-theme consumer fixture. Inspect built artifacts or a bundler manifest to demonstrate that the other nine theme assets are absent.

Run accessibility checks against representative rendered components in all twenty theme/mode combinations. Manually inspect representative desktop and mobile states, visible focus, reduced motion, and forced-colors behavior where tooling permits. Report exactly what ran, what passed, and what remains unverified; automated scans are not proof of full WCAG conformance.

## 10. Repository and documentation deliverables

Organize the repository with clear boundaries, for example:

```text
packages/
  token-contract/
  core/
  components/
  themes/
    minimalist-nordic/
    ...nine other standalone theme packages
apps/
  dashboard/
  single-theme-fixture/
skills/
  design-system/
    SKILL.md
docs/
  architecture.md
  tokens.md
  creating-themes.md
  accessibility.md
```

Adapt paths to existing repository conventions. Include:

- A README with installation, development, build, test, and consumption instructions.
- A Mermaid architecture diagram showing package dependencies and theme-loading flow.
- Public API documentation and examples for both single-theme and gallery consumers.
- A theme authoring guide covering registration, contract compatibility, and validation.
- Contribution guidelines and a practical token-versioning policy.
- An appropriate open-source license for a new project, or preservation of an existing license, with third-party asset attribution where needed.
- CI checks for the meaningful build, contract, behavior, and bundle-isolation validations.

## 11. Definition of done

The work is complete when:

1. A fresh checkout can install dependencies and run the demo using documented commands.
2. All ten themes work in light, dark, and system preference modes without changing component code.
3. A new standalone theme can be registered without modifying core or component packages.
4. The single-theme fixture demonstrably excludes all unrelated theme assets.
5. Dashboard interactions work across themes and responsive layouts.
6. The agent skill references real APIs, tokens, and executable validation commands.
7. Required checks have been run, with failures and tooling limitations reported honestly.

Finish with a concise handoff: what was built, where the key files live, how to run it, verification results, and any remaining limitations. Do not replace implementation with a roadmap or claim checks were run when they were not.
