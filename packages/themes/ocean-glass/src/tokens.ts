import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#edf7fa', surface: '#f9fdfe', raised: '#ffffff', subtle: '#dceff3', text: '#12323d', textSecondary: '#365864', textMuted: '#4f6d76',
    border: '#a5c5cd', borderStrong: '#5f8c98', primary: '#076585', primaryFg: '#ffffff', primaryHover: '#084c64', primaryActive: '#063a4d', focus: '#007f9e',
    selected: '#d4edf4', selectedFg: '#084b60', successBg: '#d9f2e8', successFg: '#1d6149', successBorder: '#398c6d',
    warningBg: '#f8edcb', warningFg: '#715016', warningBorder: '#a37b2c', errorBg: '#f9e1e2', errorFg: '#96363f', errorBorder: '#96363f',
    infoBg: '#d9eef8', infoFg: '#185b7c', infoBorder: '#3983a6', radius: '14px', shadow: '0 12px 32px rgb(20 91 110 / 0.14)',
  }), { 'shadow-sm': 'inset 0 1px 0 rgb(255 255 255 / 0.8), 0 2px 8px rgb(20 91 110 / 0.10)' }),
  dark: createThemeTokens(definePalette({
    page: '#0b1d26', surface: '#112b36', raised: '#193a47', subtle: '#20434f', text: '#edf9fc', textSecondary: '#c2dce3', textMuted: '#a4c2ca',
    border: '#4b7380', borderStrong: '#8fb4bf', primary: '#7edcf3', primaryFg: '#072c39', primaryHover: '#adebf9', primaryActive: '#d3f5fc', focus: '#70f0e1',
    selected: '#214f5f', selectedFg: '#e5f9ff', successBg: '#173d33', successFg: '#9de4c7', successBorder: '#64bd99',
    warningBg: '#41371d', warningFg: '#ead79f', warningBorder: '#c4a55d', errorBg: '#45272d', errorFg: '#f0b5bd', errorBorder: '#dc8e9b',
    infoBg: '#183a50', infoFg: '#b0dcf3', infoBorder: '#70b3d5', danger: '#dc8e9b', dangerFg: '#351218', dangerHover: '#f0b5bd',
    radius: '14px', shadow: '0 14px 36px rgb(0 0 0 / 0.32)',
  }), { 'shadow-sm': 'inset 0 1px 0 rgb(255 255 255 / 0.08), 0 2px 8px rgb(0 0 0 / 0.24)' }),
};
