import contract from './contract.json';

export const TOKEN_CONTRACT_VERSION = contract.version;
export const tokenDefinitions = contract.tokens;
export const tokenNames = tokenDefinitions.map((token) => token.name);
export type TokenName = (typeof tokenNames)[number];
export type TokenValues = Record<string, string>;
export type ColorMode = 'light' | 'dark';
export type ModePreference = ColorMode | 'system';

export interface ReferenceTokens {
  page: string;
  surface: string;
  raised: string;
  subtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  inverse: string;
  border: string;
  borderStrong: string;
  link: string;
  linkHover: string;
  primary: string;
  primaryFg: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryFg: string;
  secondaryBorder: string;
  secondaryHover: string;
  secondaryActive: string;
  danger: string;
  dangerFg: string;
  dangerHover: string;
  disabled: string;
  disabledFg: string;
  selected: string;
  selectedFg: string;
  focus: string;
  input: string;
  inputFg: string;
  inputBorder: string;
  placeholder: string;
  invalid: string;
  overlay: string;
  successBg: string;
  successFg: string;
  successBorder: string;
  warningBg: string;
  warningFg: string;
  warningBorder: string;
  errorBg: string;
  errorFg: string;
  errorBorder: string;
  infoBg: string;
  infoFg: string;
  infoBorder: string;
  bodyFont?: string;
  headingFont?: string;
  monoFont?: string;
  density?: number;
  radius?: string;
  borderWidth?: string;
  shadow?: string;
  duration?: string;
}

export interface ThemeDefinition {
  light: TokenValues;
  dark: TokenValues;
}

export interface ThemePlugin {
  id: string;
  name: string;
  version: string;
  contractVersion: string;
  modes: readonly ColorMode[];
  load: () => Promise<ThemeDefinition>;
}

export interface ThemeManifest extends Omit<ThemePlugin, 'load'> {}

const fontStack = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const monoStack = "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

type PaletteInput = Partial<ReferenceTokens> &
  Pick<ReferenceTokens, 'page' | 'surface' | 'text' | 'primary' | 'primaryFg' | 'primaryHover' | 'primaryActive' | 'focus'>;

/** Supplies deterministic aliases while keeping every resolved semantic value explicit and testable. */
export function definePalette(input: PaletteInput): ReferenceTokens {
  const raised = input.raised ?? input.surface;
  const subtle = input.subtle ?? input.page;
  const border = input.border ?? input.text;
  const borderStrong = input.borderStrong ?? input.text;
  const errorBorder = input.errorBorder ?? '#b42318';
  return {
    ...input,
    raised,
    subtle,
    textSecondary: input.textSecondary ?? input.text,
    textMuted: input.textMuted ?? input.textSecondary ?? input.text,
    inverse: input.inverse ?? input.primaryFg,
    border,
    borderStrong,
    link: input.link ?? input.primary,
    linkHover: input.linkHover ?? input.primaryHover,
    secondary: input.secondary ?? input.surface,
    secondaryFg: input.secondaryFg ?? input.text,
    secondaryBorder: input.secondaryBorder ?? borderStrong,
    secondaryHover: input.secondaryHover ?? subtle,
    secondaryActive: input.secondaryActive ?? input.selected ?? subtle,
    danger: input.danger ?? errorBorder,
    dangerFg: input.dangerFg ?? '#ffffff',
    dangerHover: input.dangerHover ?? errorBorder,
    disabled: input.disabled ?? subtle,
    disabledFg: input.disabledFg ?? input.textMuted ?? input.text,
    selected: input.selected ?? subtle,
    selectedFg: input.selectedFg ?? input.text,
    input: input.input ?? input.surface,
    inputFg: input.inputFg ?? input.text,
    inputBorder: input.inputBorder ?? borderStrong,
    placeholder: input.placeholder ?? input.textMuted ?? input.text,
    invalid: input.invalid ?? errorBorder,
    overlay: input.overlay ?? 'rgb(0 0 0 / 0.55)',
    successBg: input.successBg ?? subtle,
    successFg: input.successFg ?? input.text,
    successBorder: input.successBorder ?? border,
    warningBg: input.warningBg ?? subtle,
    warningFg: input.warningFg ?? input.text,
    warningBorder: input.warningBorder ?? border,
    errorBg: input.errorBg ?? subtle,
    errorFg: input.errorFg ?? input.text,
    errorBorder,
    infoBg: input.infoBg ?? subtle,
    infoFg: input.infoFg ?? input.text,
    infoBorder: input.infoBorder ?? border,
  };
}

/** Deterministically composes a complete semantic map from reference values. */
export function createThemeTokens(
  reference: ReferenceTokens,
  overrides: Partial<TokenValues> = {},
): TokenValues {
  const density = reference.density ?? 1;
  const px = (value: number) => `${Math.round(value * density * 100) / 100}px`;
  const values: TokenValues = {
    'color-page-bg': reference.page,
    'color-surface-bg': reference.surface,
    'color-surface-raised': reference.raised,
    'color-surface-subtle': reference.subtle,
    'color-text-primary': reference.text,
    'color-text-secondary': reference.textSecondary,
    'color-text-muted': reference.textMuted,
    'color-text-inverse': reference.inverse,
    'color-border': reference.border,
    'color-border-strong': reference.borderStrong,
    'color-link': reference.link,
    'color-link-hover': reference.linkHover,
    'color-action-primary-bg': reference.primary,
    'color-action-primary-fg': reference.primaryFg,
    'color-action-primary-hover': reference.primaryHover,
    'color-action-primary-active': reference.primaryActive,
    'color-action-secondary-bg': reference.secondary,
    'color-action-secondary-fg': reference.secondaryFg,
    'color-action-secondary-border': reference.secondaryBorder,
    'color-action-secondary-hover': reference.secondaryHover,
    'color-action-secondary-active': reference.secondaryActive,
    'color-action-destructive-bg': reference.danger,
    'color-action-destructive-fg': reference.dangerFg,
    'color-action-destructive-hover': reference.dangerHover,
    'color-disabled-bg': reference.disabled,
    'color-disabled-fg': reference.disabledFg,
    'color-selected-bg': reference.selected,
    'color-selected-fg': reference.selectedFg,
    'color-focus-ring': reference.focus,
    'color-input-bg': reference.input,
    'color-input-fg': reference.inputFg,
    'color-input-border': reference.inputBorder,
    'color-input-placeholder': reference.placeholder,
    'color-invalid': reference.invalid,
    'color-overlay-bg': reference.overlay,
    'color-success-bg': reference.successBg,
    'color-success-fg': reference.successFg,
    'color-success-border': reference.successBorder,
    'color-warning-bg': reference.warningBg,
    'color-warning-fg': reference.warningFg,
    'color-warning-border': reference.warningBorder,
    'color-error-bg': reference.errorBg,
    'color-error-fg': reference.errorFg,
    'color-error-border': reference.errorBorder,
    'color-info-bg': reference.infoBg,
    'color-info-fg': reference.infoFg,
    'color-info-border': reference.infoBorder,
    'font-family-body': reference.bodyFont ?? fontStack,
    'font-family-heading': reference.headingFont ?? reference.bodyFont ?? fontStack,
    'font-family-mono': reference.monoFont ?? monoStack,
    'font-size-xs': px(12),
    'font-size-sm': px(13),
    'font-size-md': px(15),
    'font-size-lg': px(17),
    'font-size-xl': px(21),
    'font-size-2xl': px(28),
    'font-size-3xl': px(38),
    'font-weight-regular': '400',
    'font-weight-medium': '500',
    'font-weight-semibold': '600',
    'font-weight-bold': '700',
    'line-height-tight': '1.2',
    'line-height-normal': '1.5',
    'line-height-relaxed': '1.7',
    'letter-spacing-tight': '-0.025em',
    'letter-spacing-normal': '0',
    'letter-spacing-wide': '0.06em',
    'space-0': '0px',
    'space-1': px(4),
    'space-2': px(8),
    'space-3': px(12),
    'space-4': px(16),
    'space-5': px(20),
    'space-6': px(24),
    'space-8': px(32),
    'space-10': px(40),
    'space-12': px(48),
    'control-height-sm': px(32),
    'control-height-md': px(42),
    'control-height-lg': px(50),
    'content-width-sm': '42rem',
    'content-width-md': '68rem',
    'content-width-lg': '96rem',
    'navigation-width': px(248),
    'border-width': reference.borderWidth ?? '1px',
    'border-width-strong': '2px',
    'radius-none': '0px',
    'radius-sm': reference.radius ?? '4px',
    'radius-md': reference.radius ?? '8px',
    'radius-lg': reference.radius ?? '12px',
    'radius-full': '999px',
    'shadow-sm': reference.shadow ?? '0 1px 2px rgb(0 0 0 / 0.08)',
    'shadow-md': reference.shadow ?? '0 8px 24px rgb(0 0 0 / 0.10)',
    'shadow-lg': reference.shadow ?? '0 24px 64px rgb(0 0 0 / 0.18)',
    'layer-dropdown': '20',
    'layer-modal': '1000',
    'layer-toast': '1100',
    'motion-duration-fast': reference.duration ?? '120ms',
    'motion-duration-normal': reference.duration ?? '180ms',
    'motion-duration-slow': '280ms',
    'motion-easing-standard': 'cubic-bezier(0.2, 0, 0, 1)',
    'motion-easing-enter': 'cubic-bezier(0, 0, 0.2, 1)',
    'motion-easing-exit': 'cubic-bezier(0.4, 0, 1, 1)',
    ...overrides,
  };
  return validateThemeTokens(values, 'composed theme');
}

export function validateThemeTokens(values: unknown, context = 'theme'): TokenValues {
  if (!values || typeof values !== 'object') {
    throw new Error(`[token-contract] ${context} must be an object of token values.`);
  }
  const record = values as Record<string, unknown>;
  const missing = tokenNames.filter((name) => {
    const value = record[name];
    return typeof value !== 'string' || value.trim().length === 0;
  });
  if (missing.length) {
    throw new Error(`[token-contract] ${context} is missing required tokens: ${missing.join(', ')}.`);
  }
  return record as TokenValues;
}

export function validateThemeDefinition(definition: unknown, themeId: string): ThemeDefinition {
  if (!definition || typeof definition !== 'object') {
    throw new Error(`[token-contract] Theme "${themeId}" did not return a definition.`);
  }
  const candidate = definition as Partial<ThemeDefinition>;
  return {
    light: validateThemeTokens(candidate.light, `${themeId}.light`),
    dark: validateThemeTokens(candidate.dark, `${themeId}.dark`),
  };
}

export function assertCompatibleContract(actual: string, themeId: string): void {
  const expectedMajor = TOKEN_CONTRACT_VERSION.split('.')[0];
  const actualMajor = actual.split('.')[0];
  if (actualMajor !== expectedMajor) {
    throw new Error(
      `[token-contract] Theme "${themeId}" uses contract ${actual}, but runtime requires ${TOKEN_CONTRACT_VERSION}. Install a theme built for contract major ${expectedMajor}.`,
    );
  }
}
