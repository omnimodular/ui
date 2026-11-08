import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#f1f5f9', surface: '#ffffff', raised: '#ffffff', subtle: '#e2e8f0',
    text: '#172033', textSecondary: '#3c4a60', textMuted: '#53627a', border: '#b8c2d0', borderStrong: '#64748b',
    primary: '#1d4ed8', primaryFg: '#ffffff', primaryHover: '#1e40af', primaryActive: '#172f78', focus: '#1d4ed8',
    selected: '#dbeafe', selectedFg: '#1e3a8a', successBg: '#dcfce7', successFg: '#166534', successBorder: '#15803d',
    warningBg: '#fef3c7', warningFg: '#854d0e', warningBorder: '#a16207', errorBg: '#fee2e2', errorFg: '#b91c1c', errorBorder: '#b91c1c',
    infoBg: '#dbeafe', infoFg: '#1e40af', infoBorder: '#2563eb', density: 0.9, radius: '3px', shadow: '0 1px 3px rgb(15 23 42 / 0.12)', duration: '100ms',
  })),
  dark: createThemeTokens(definePalette({
    page: '#0f172a', surface: '#182238', raised: '#202c43', subtle: '#29364b',
    text: '#f1f5f9', textSecondary: '#cbd5e1', textMuted: '#a8b5c7', border: '#526078', borderStrong: '#94a3b8',
    primary: '#93b4ff', primaryFg: '#101d3d', primaryHover: '#b8ccff', primaryActive: '#d6e1ff', focus: '#a5c1ff',
    selected: '#253e68', selectedFg: '#e5efff', successBg: '#153a2a', successFg: '#86efac', successBorder: '#4ade80',
    warningBg: '#45330f', warningFg: '#fde68a', warningBorder: '#facc15', errorBg: '#481d24', errorFg: '#fda4af', errorBorder: '#fb7185',
    infoBg: '#172f52', infoFg: '#bfdbfe', infoBorder: '#60a5fa', danger: '#fb7185', dangerFg: '#390b15', dangerHover: '#fda4af',
    density: 0.9, radius: '3px', shadow: '0 2px 6px rgb(0 0 0 / 0.35)', duration: '100ms',
  })),
};
