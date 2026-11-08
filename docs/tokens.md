# Design tokens

Contract version **1.0.0**. [contract.json](../packages/token-contract/src/contract.json) is the authoritative machine-readable list; this table is generated from it by `node scripts/generate-token-docs.mjs`. Every theme resolves every token for both modes before application. Missing values throw actionable errors rather than falling through to browser defaults.

## Runtime and usage

Runtime names are CSS custom properties prefixed with `--`. Components consume semantic roles such as `--color-action-primary-bg`; reference palette values are authoring inputs and are not component APIs. Structural CSS such as `display: flex` does not need tokens.

“Default/composition” describes `createThemeTokens(definePalette(...), overrides)`. Explicit theme overrides take precedence. Color has no universal visual default: each identity supplies reference colors, including status pairs. Typography, density, radii, borders, shadows, and motion use the deterministic defaults below. Supplied themes vary **color and shadow tokens by mode**. Typography, layout, shape, layering, and motion stay consistent between a theme's light and dark appearances. Reduced-motion behavior is implemented by component CSS and applies to every theme.

All bundled surfaces are opaque. Only `--color-overlay-bg` uses alpha, for the modal backdrop; it is not a text/background contrast pair. Ocean Glass conveys layering with opaque surfaces and inset shadows rather than requiring backdrop-filter support.

## Complete token reference

| Token | Type | Default/composition | Intended use |
| --- | --- | --- | --- |
| `--color-page-bg` | color | reference.page | Page canvas. |
| `--color-surface-bg` | color | reference.surface | Primary cards, fields and panels. |
| `--color-surface-raised` | color | reference.raised | Elevated surfaces and popovers. |
| `--color-surface-subtle` | color | reference.subtle | Recessed groups and table headers. |
| `--color-text-primary` | color | reference.text | Primary readable text. |
| `--color-text-secondary` | color | reference.textSecondary | Secondary readable text. |
| `--color-text-muted` | color | reference.textMuted | Nonessential but readable metadata. |
| `--color-text-inverse` | color | reference.inverse | Text on inverse or filled surfaces. |
| `--color-border` | color | reference.border | Default boundaries. |
| `--color-border-strong` | color | reference.borderStrong | Emphasized boundaries and control outlines. |
| `--color-link` | color | reference.link ?? primary | Inline links. |
| `--color-link-hover` | color | reference.linkHover ?? primaryHover | Hovered links. |
| `--color-action-primary-bg` | color | reference.primary | Primary action background. |
| `--color-action-primary-fg` | color | reference.primaryFg | Primary action foreground. |
| `--color-action-primary-hover` | color | reference.primaryHover | Primary action hover background. |
| `--color-action-primary-active` | color | reference.primaryActive | Primary action active background. |
| `--color-action-secondary-bg` | color | reference.secondary ?? surface | Secondary action background. |
| `--color-action-secondary-fg` | color | reference.secondaryFg ?? text | Secondary action foreground. |
| `--color-action-secondary-border` | color | reference.secondaryBorder ?? borderStrong | Secondary action border. |
| `--color-action-secondary-hover` | color | reference.secondaryHover ?? subtle | Secondary action hover background. |
| `--color-action-secondary-active` | color | reference.secondaryActive ?? selected ?? subtle | Secondary action active background. |
| `--color-action-destructive-bg` | color | reference.danger ?? errorBorder | Destructive action background. |
| `--color-action-destructive-fg` | color | reference.dangerFg ?? #ffffff | Destructive action foreground. |
| `--color-action-destructive-hover` | color | reference.dangerHover ?? errorBorder | Destructive action hover background. |
| `--color-disabled-bg` | color | reference.disabled ?? subtle | Disabled control background. |
| `--color-disabled-fg` | color | reference.disabledFg ?? textMuted | Disabled control foreground. |
| `--color-selected-bg` | color | reference.selected ?? subtle | Selected item background. |
| `--color-selected-fg` | color | reference.selectedFg ?? text | Selected item foreground. |
| `--color-focus-ring` | color | reference.focus | Focus-visible indicator. |
| `--color-input-bg` | color | reference.input ?? surface | Text input background. |
| `--color-input-fg` | color | reference.inputFg ?? text | Text input foreground. |
| `--color-input-border` | color | reference.inputBorder ?? borderStrong | Text input boundary. |
| `--color-input-placeholder` | color | reference.placeholder ?? textMuted | Readable placeholder text. |
| `--color-invalid` | color | reference.invalid ?? errorBorder | Invalid boundary and feedback. |
| `--color-overlay-bg` | color | reference.overlay ?? rgb(0 0 0 / .55) | Modal backdrop; may include alpha. |
| `--color-success-bg` | color | reference.successBg ?? subtle | Success badge background. |
| `--color-success-fg` | color | reference.successFg ?? text | Success badge foreground. |
| `--color-success-border` | color | reference.successBorder ?? border | Success badge boundary. |
| `--color-warning-bg` | color | reference.warningBg ?? subtle | Warning badge background. |
| `--color-warning-fg` | color | reference.warningFg ?? text | Warning badge foreground. |
| `--color-warning-border` | color | reference.warningBorder ?? border | Warning badge boundary. |
| `--color-error-bg` | color | reference.errorBg ?? subtle | Error badge background. |
| `--color-error-fg` | color | reference.errorFg ?? text | Error badge foreground. |
| `--color-error-border` | color | reference.errorBorder ?? border | Error badge boundary. |
| `--color-info-bg` | color | reference.infoBg ?? subtle | Information badge background. |
| `--color-info-fg` | color | reference.infoFg ?? text | Information badge foreground. |
| `--color-info-border` | color | reference.infoBorder ?? border | Information badge boundary. |
| `--font-family-body` | font-family | reference.bodyFont ?? system sans-serif stack | Body and control typeface stack. |
| `--font-family-heading` | font-family | reference.headingFont ?? bodyFont | Heading typeface stack. |
| `--font-family-mono` | font-family | reference.monoFont ?? system monospace stack | Code and tabular data typeface stack. |
| `--font-size-xs` | length | 12px × density (default 1) | Small metadata. |
| `--font-size-sm` | length | 13px × density (default 1) | Secondary text. |
| `--font-size-md` | length | 15px × density (default 1) | Default body and controls. |
| `--font-size-lg` | length | 17px × density (default 1) | Large body and small headings. |
| `--font-size-xl` | length | 21px × density (default 1) | Section headings. |
| `--font-size-2xl` | length | 28px × density (default 1) | Page headings. |
| `--font-size-3xl` | length | 38px × density (default 1) | Display heading. |
| `--font-weight-regular` | font-weight | 400 | Body copy. |
| `--font-weight-medium` | font-weight | 500 | Labels and metadata. |
| `--font-weight-semibold` | font-weight | 600 | Buttons and section headings. |
| `--font-weight-bold` | font-weight | 700 | Display headings. |
| `--line-height-tight` | number | 1.2 | Headings. |
| `--line-height-normal` | number | 1.5 | Controls and normal copy. |
| `--line-height-relaxed` | number | 1.7 | Long-form copy. |
| `--letter-spacing-tight` | length | -0.025em | Large headings. |
| `--letter-spacing-normal` | length | 0 | Body copy. |
| `--letter-spacing-wide` | length | 0.06em | Eyebrows and compact labels. |
| `--space-0` | length | 0px × density | No spacing. |
| `--space-1` | length | 4px × density | Smallest spacing step. |
| `--space-2` | length | 8px × density | Compact spacing step. |
| `--space-3` | length | 12px × density | Small spacing step. |
| `--space-4` | length | 16px × density | Default spacing step. |
| `--space-5` | length | 20px × density | Medium spacing step. |
| `--space-6` | length | 24px × density | Large spacing step. |
| `--space-8` | length | 32px × density | Extra-large spacing step. |
| `--space-10` | length | 40px × density | Section spacing step. |
| `--space-12` | length | 48px × density | Page spacing step. |
| `--control-height-sm` | length | 32px × density | Compact controls. |
| `--control-height-md` | length | 42px × density | Default controls. |
| `--control-height-lg` | length | 50px × density | Prominent controls. |
| `--content-width-sm` | length | 42rem | Narrow reading width. |
| `--content-width-md` | length | 68rem | Medium content width. |
| `--content-width-lg` | length | 96rem | Dashboard content width. |
| `--navigation-width` | length | 248px × density | Desktop navigation width. |
| `--border-width` | length | reference.borderWidth ?? 1px | Default border width. |
| `--border-width-strong` | length | 2px | Emphasized border width. |
| `--radius-none` | length | 0px | Square corners. |
| `--radius-sm` | length | reference.radius ?? 4px | Small corner radius. |
| `--radius-md` | length | reference.radius ?? 8px | Default corner radius. |
| `--radius-lg` | length | reference.radius ?? 12px | Large corner radius. |
| `--radius-full` | length | 999px | Pill corner radius. |
| `--shadow-sm` | shadow | reference.shadow ?? subtle opaque shadow | Subtle elevation. |
| `--shadow-md` | shadow | reference.shadow ?? medium opaque shadow | Card elevation. |
| `--shadow-lg` | shadow | reference.shadow ?? large opaque shadow | Dialog and overlay elevation. |
| `--layer-dropdown` | number | 20 | Dropdown stacking level. |
| `--layer-modal` | number | 1000 | Modal stacking level. |
| `--layer-toast` | number | 1100 | Toast stacking level. |
| `--motion-duration-fast` | duration | reference.duration ?? 120ms | Hover and small state transitions. |
| `--motion-duration-normal` | duration | reference.duration ?? 180ms | Panels and dialogs. |
| `--motion-duration-slow` | duration | 280ms | Expressive entrances. |
| `--motion-easing-standard` | easing | cubic-bezier(0.2, 0, 0, 1) | Standard state easing. |
| `--motion-easing-enter` | easing | cubic-bezier(0, 0, 0.2, 1) | Entrance easing. |
| `--motion-easing-exit` | easing | cubic-bezier(0.4, 0, 1, 1) | Exit easing. |

## Responsive layout

The content-width and navigation tokens size containers but are not media-query conditions. CSS custom properties cannot be relied on inside media queries. Component/demo styles therefore use supported static breakpoints at **1100px** and **760px**. Applications can use their own build-time breakpoint strategy without changing token values.
