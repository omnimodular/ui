import { readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('../packages/token-contract/src/contract.json', import.meta.url), 'utf8'));
const colorReferences = {
  'color-page-bg': 'page', 'color-surface-bg': 'surface', 'color-surface-raised': 'raised', 'color-surface-subtle': 'subtle',
  'color-text-primary': 'text', 'color-text-secondary': 'textSecondary', 'color-text-muted': 'textMuted', 'color-text-inverse': 'inverse',
  'color-border': 'border', 'color-border-strong': 'borderStrong', 'color-link': 'link ?? primary', 'color-link-hover': 'linkHover ?? primaryHover',
  'color-action-primary-bg': 'primary', 'color-action-primary-fg': 'primaryFg', 'color-action-primary-hover': 'primaryHover', 'color-action-primary-active': 'primaryActive',
  'color-action-secondary-bg': 'secondary ?? surface', 'color-action-secondary-fg': 'secondaryFg ?? text', 'color-action-secondary-border': 'secondaryBorder ?? borderStrong',
  'color-action-secondary-hover': 'secondaryHover ?? subtle', 'color-action-secondary-active': 'secondaryActive ?? selected ?? subtle',
  'color-action-destructive-bg': 'danger ?? errorBorder', 'color-action-destructive-fg': 'dangerFg ?? #ffffff', 'color-action-destructive-hover': 'dangerHover ?? errorBorder',
  'color-disabled-bg': 'disabled ?? subtle', 'color-disabled-fg': 'disabledFg ?? textMuted', 'color-selected-bg': 'selected ?? subtle', 'color-selected-fg': 'selectedFg ?? text',
  'color-focus-ring': 'focus', 'color-input-bg': 'input ?? surface', 'color-input-fg': 'inputFg ?? text', 'color-input-border': 'inputBorder ?? borderStrong',
  'color-input-placeholder': 'placeholder ?? textMuted', 'color-invalid': 'invalid ?? errorBorder', 'color-overlay-bg': 'overlay ?? rgb(0 0 0 / .55)',
};
for (const status of ['success', 'warning', 'error', 'info']) {
  const cap = status[0].toUpperCase() + status.slice(1);
  for (const role of ['Bg', 'Fg', 'Border']) colorReferences[`color-${status}-${role.toLowerCase()}`] = `${status}${role} ?? ${role === 'Bg' ? 'subtle' : role === 'Fg' ? 'text' : 'border'}`;
}
const sizes = { xs: 12, sm: 13, md: 15, lg: 17, xl: 21, '2xl': 28, '3xl': 38 };
const spaces = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 };
const fixed = {
  'font-family-body': 'reference.bodyFont ?? system sans-serif stack', 'font-family-heading': 'reference.headingFont ?? bodyFont', 'font-family-mono': 'reference.monoFont ?? system monospace stack',
  'font-weight-regular': '400', 'font-weight-medium': '500', 'font-weight-semibold': '600', 'font-weight-bold': '700',
  'line-height-tight': '1.2', 'line-height-normal': '1.5', 'line-height-relaxed': '1.7', 'letter-spacing-tight': '-0.025em', 'letter-spacing-normal': '0', 'letter-spacing-wide': '0.06em',
  'content-width-sm': '42rem', 'content-width-md': '68rem', 'content-width-lg': '96rem', 'border-width': 'reference.borderWidth ?? 1px', 'border-width-strong': '2px',
  'radius-none': '0px', 'radius-sm': 'reference.radius ?? 4px', 'radius-md': 'reference.radius ?? 8px', 'radius-lg': 'reference.radius ?? 12px', 'radius-full': '999px',
  'shadow-sm': 'reference.shadow ?? subtle opaque shadow', 'shadow-md': 'reference.shadow ?? medium opaque shadow', 'shadow-lg': 'reference.shadow ?? large opaque shadow',
  'layer-dropdown': '20', 'layer-modal': '1000', 'layer-toast': '1100', 'motion-duration-fast': 'reference.duration ?? 120ms', 'motion-duration-normal': 'reference.duration ?? 180ms', 'motion-duration-slow': '280ms',
  'motion-easing-standard': 'cubic-bezier(0.2, 0, 0, 1)', 'motion-easing-enter': 'cubic-bezier(0, 0, 0.2, 1)', 'motion-easing-exit': 'cubic-bezier(0.4, 0, 1, 1)',
};
function fallback(name) {
  if (colorReferences[name]) return `reference.${colorReferences[name]}`;
  if (fixed[name]) return fixed[name];
  if (name.startsWith('font-size-')) return `${sizes[name.replace('font-size-', '')]}px × density (default 1)`;
  if (name.startsWith('space-')) return `${spaces[name.replace('space-', '')]}px × density`;
  if (name.startsWith('control-height-')) return `${{ sm: 32, md: 42, lg: 50 }[name.replace('control-height-', '')]}px × density`;
  if (name === 'navigation-width') return '248px × density';
  throw new Error(`No documented composition for ${name}`);
}
const rows = contract.tokens.map((token) => `| \`--${token.name}\` | ${token.type} | ${fallback(token.name)} | ${token.description} |`);
const output = `# Design tokens\n\nContract version **${contract.version}**. [contract.json](../packages/token-contract/src/contract.json) is the authoritative machine-readable list; this table is generated from it by \`node scripts/generate-token-docs.mjs\`. Every theme resolves every token for both modes before application. Missing values throw actionable errors rather than falling through to browser defaults.\n\n## Runtime and usage\n\nRuntime names are CSS custom properties prefixed with \`--\`. Components consume semantic roles such as \`--color-action-primary-bg\`; reference palette values are authoring inputs and are not component APIs. Structural CSS such as \`display: flex\` does not need tokens.\n\n“Default/composition” describes \`createThemeTokens(definePalette(...), overrides)\`. Explicit theme overrides take precedence. Color has no universal visual default: each identity supplies reference colors, including status pairs. Typography, density, radii, borders, shadows, and motion use the deterministic defaults below. Supplied themes vary **color and shadow tokens by mode**. Typography, layout, shape, layering, and motion stay consistent between a theme's light and dark appearances. Reduced-motion behavior is implemented by component CSS and applies to every theme.\n\nAll bundled surfaces are opaque. Only \`--color-overlay-bg\` uses alpha, for the modal backdrop; it is not a text/background contrast pair. Ocean Glass conveys layering with opaque surfaces and inset shadows rather than requiring backdrop-filter support.\n\n## Complete token reference\n\n| Token | Type | Default/composition | Intended use |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n\n## Responsive layout\n\nThe content-width and navigation tokens size containers but are not media-query conditions. CSS custom properties cannot be relied on inside media queries. Component/demo styles therefore use supported static breakpoints at **1100px** and **760px**. Applications can use their own build-time breakpoint strategy without changing token values.\n`;
await writeFile(new URL('../docs/tokens.md', import.meta.url), output);
console.log(`Documented ${contract.tokens.length} tokens.`);
