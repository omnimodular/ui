import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#ffffff', surface: '#ffffff', raised: '#ffffff', subtle: '#f2f2f2', text: '#000000', textSecondary: '#161616', textMuted: '#303030',
    border: '#000000', borderStrong: '#000000', primary: '#0000cc', primaryFg: '#ffffff', primaryHover: '#00008f', primaryActive: '#000060', focus: '#9a5b00',
    selected: '#fff000', selectedFg: '#000000', disabled: '#eeeeee', disabledFg: '#4a4a4a',
    successBg: '#ffffff', successFg: '#005a24', successBorder: '#005a24', warningBg: '#fff4b8', warningFg: '#4d2e00', warningBorder: '#4d2e00',
    errorBg: '#ffffff', errorFg: '#a40000', errorBorder: '#a40000', infoBg: '#ffffff', infoFg: '#004f9e', infoBorder: '#004f9e',
    radius: '0px', borderWidth: '2px', shadow: 'none', duration: '0ms',
  }), { 'border-width-strong': '3px', 'font-weight-semibold': '700' }),
  dark: createThemeTokens(definePalette({
    page: '#000000', surface: '#000000', raised: '#0a0a0a', subtle: '#191919', text: '#ffffff', textSecondary: '#ffffff', textMuted: '#e0e0e0',
    border: '#ffffff', borderStrong: '#ffffff', primary: '#ffff00', primaryFg: '#000000', primaryHover: '#ffff99', primaryActive: '#ffffff', focus: '#00ffff',
    selected: '#005f73', selectedFg: '#ffffff', disabled: '#222222', disabledFg: '#bdbdbd',
    successBg: '#001c0b', successFg: '#70ff9e', successBorder: '#70ff9e', warningBg: '#2b2100', warningFg: '#fff200', warningBorder: '#fff200',
    errorBg: '#2b0000', errorFg: '#ff9e9e', errorBorder: '#ff9e9e', infoBg: '#00172b', infoFg: '#8ed8ff', infoBorder: '#8ed8ff',
    danger: '#ff9e9e', dangerFg: '#000000', dangerHover: '#ffc7c7', radius: '0px', borderWidth: '2px', shadow: 'none', duration: '0ms',
  }), { 'border-width-strong': '3px', 'font-weight-semibold': '700' }),
};
