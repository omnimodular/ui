import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#e8ede5', surface: '#f5f8f1', raised: '#ffffff', subtle: '#d7e0d2', text: '#173222', textSecondary: '#355341', textMuted: '#4c6554',
    border: '#6b8170', borderStrong: '#264b32', primary: '#184e2b', primaryFg: '#ffffff', primaryHover: '#0f391e', primaryActive: '#092715', focus: '#8a3f00',
    selected: '#cde3c6', selectedFg: '#173f24', successBg: '#d6ead2', successFg: '#245328', successBorder: '#3b743e',
    warningBg: '#f2e9bf', warningFg: '#62500b', warningBorder: '#887316', errorBg: '#f1d9d3', errorFg: '#873626', errorBorder: '#873626',
    infoBg: '#d8e6e2', infoFg: '#29574f', infoBorder: '#417c70', bodyFont: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
    headingFont: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace", radius: '0px', shadow: '3px 3px 0 #49634e', duration: '60ms',
  }), { 'radius-full': '0px', 'letter-spacing-wide': '0.09em' }),
  dark: createThemeTokens(definePalette({
    page: '#07130b', surface: '#0b1d10', raised: '#102817', subtle: '#15341d', text: '#d2f7d9', textSecondary: '#a6d9b0', textMuted: '#8cba94',
    border: '#477d51', borderStrong: '#73c883', primary: '#53ef7f', primaryFg: '#06180a', primaryHover: '#92ffa9', primaryActive: '#c0ffcb', focus: '#ffbf47',
    selected: '#1c4b28', selectedFg: '#d9ffe0', successBg: '#12351b', successFg: '#8eef9f', successBorder: '#53c96a',
    warningBg: '#3b320e', warningFg: '#f2df83', warningBorder: '#d1ba3e', errorBg: '#401b17', errorFg: '#ffada0', errorBorder: '#ef8270',
    infoBg: '#11332d', infoFg: '#9de3d5', infoBorder: '#5bbbad', danger: '#ef8270', dangerFg: '#310b07', dangerHover: '#ffada0',
    bodyFont: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace", headingFont: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
    radius: '0px', shadow: '3px 3px 0 #285332', duration: '60ms',
  }), { 'radius-full': '0px', 'letter-spacing-wide': '0.09em' }),
};
