import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#faf6fc', surface: '#fffdfd', raised: '#ffffff', subtle: '#f0e6f5', text: '#352b40', textSecondary: '#5b4d68', textMuted: '#71617e',
    border: '#cdbdd7', borderStrong: '#947da5', primary: '#684596', primaryFg: '#ffffff', primaryHover: '#523579', primaryActive: '#3e285c', focus: '#8b4aa8',
    selected: '#eadcf5', selectedFg: '#4d2e70', successBg: '#dcf3e7', successFg: '#236244', successBorder: '#438b68',
    warningBg: '#fff0d4', warningFg: '#7a4819', warningBorder: '#ad743a', errorBg: '#fbe2e7', errorFg: '#9b314d', errorBorder: '#9b314d',
    infoBg: '#e1eefb', infoFg: '#315e8c', infoBorder: '#527fa9', radius: '18px', shadow: '0 10px 30px rgb(92 65 110 / 0.12)', duration: '220ms',
  })),
  dark: createThemeTokens(definePalette({
    page: '#211b29', surface: '#2e2538', raised: '#3a2e46', subtle: '#42334f', text: '#faf3ff', textSecondary: '#decfe8', textMuted: '#c2b0ce',
    border: '#776487', borderStrong: '#b59ac6', primary: '#d7b8ff', primaryFg: '#2b173f', primaryHover: '#e6d1ff', primaryActive: '#f1e5ff', focus: '#f0b9ff',
    selected: '#543a67', selectedFg: '#f8ecff', successBg: '#203f34', successFg: '#a6e8c7', successBorder: '#72c99e',
    warningBg: '#473721', warningFg: '#f4d6a2', warningBorder: '#d5ad6c', errorBg: '#492633', errorFg: '#f5b7c7', errorBorder: '#e592aa',
    infoBg: '#243b52', infoFg: '#bfdcf5', infoBorder: '#89b9df', danger: '#e592aa', dangerFg: '#35121f', dangerHover: '#f5b7c7',
    radius: '18px', shadow: '0 12px 32px rgb(0 0 0 / 0.28)', duration: '220ms',
  })),
};
