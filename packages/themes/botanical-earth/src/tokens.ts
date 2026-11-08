import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#f2f0e7', surface: '#fbfaf4', raised: '#fffef8', subtle: '#e4e4d3', text: '#253126', textSecondary: '#485548', textMuted: '#5e6a5c',
    border: '#b0b59b', borderStrong: '#68755d', primary: '#315e3b', primaryFg: '#ffffff', primaryHover: '#23482c', primaryActive: '#183521', focus: '#9a4f2f',
    selected: '#dce5cf', selectedFg: '#294b2d', successBg: '#dcebd5', successFg: '#355b2a', successBorder: '#557c43',
    warningBg: '#f3e5be', warningFg: '#6d4a13', warningBorder: '#9c752c', errorBg: '#f1dcd2', errorFg: '#8b402c', errorBorder: '#8b402c',
    infoBg: '#dce8e4', infoFg: '#315c55', infoBorder: '#4e8076', radius: '13px', shadow: '0 6px 18px rgb(55 67 42 / 0.11)', duration: '200ms',
  }), { 'radius-sm': '8px', 'radius-lg': '22px', 'font-family-heading': "Georgia, 'Times New Roman', serif" }),
  dark: createThemeTokens(definePalette({
    page: '#182019', surface: '#232d23', raised: '#2d392c', subtle: '#344131', text: '#eef2e5', textSecondary: '#cdd6c3', textMuted: '#b2bea8',
    border: '#64705a', borderStrong: '#a6b195', primary: '#a7d59c', primaryFg: '#173019', primaryHover: '#c2e6b9', primaryActive: '#def2d6', focus: '#e6a17d',
    selected: '#3b5035', selectedFg: '#edf6e4', successBg: '#283d24', successFg: '#b6dca2', successBorder: '#82b56c',
    warningBg: '#44371c', warningFg: '#e8d29a', warningBorder: '#c0a05b', errorBg: '#472b22', errorFg: '#edb7a3', errorBorder: '#d8947b',
    infoBg: '#233c37', infoFg: '#b0d9d0', infoBorder: '#7bb5a9', danger: '#d8947b', dangerFg: '#35170e', dangerHover: '#edb7a3',
    radius: '13px', shadow: '0 8px 22px rgb(0 0 0 / 0.28)', duration: '200ms',
  }), { 'radius-sm': '8px', 'radius-lg': '22px', 'font-family-heading': "Georgia, 'Times New Roman', serif" }),
};
