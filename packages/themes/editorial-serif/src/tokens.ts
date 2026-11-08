import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#f5f0e6', surface: '#fffdf7', raised: '#fffdf7', subtle: '#eae1d2', text: '#2b2823', textSecondary: '#514b42', textMuted: '#696155',
    border: '#bdb09b', borderStrong: '#766a56', primary: '#873d30', primaryFg: '#ffffff', primaryHover: '#682c23', primaryActive: '#4e2019', focus: '#925021',
    selected: '#ecdcbf', selectedFg: '#563217', successBg: '#e4ecd8', successFg: '#405b25', successBorder: '#5c783e',
    warningBg: '#f5e6bd', warningFg: '#6b4910', warningBorder: '#967024', errorBg: '#f4dfd8', errorFg: '#8a3529', errorBorder: '#8a3529',
    infoBg: '#e1e9eb', infoFg: '#365761', infoBorder: '#527681', bodyFont: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif",
    headingFont: "Georgia, 'Times New Roman', serif", radius: '2px', shadow: '0 3px 0 rgb(74 58 35 / 0.10)',
  }), { 'line-height-normal': '1.6', 'font-size-md': '16px', 'letter-spacing-tight': '-0.015em' }),
  dark: createThemeTokens(definePalette({
    page: '#211e19', surface: '#2c2821', raised: '#383229', subtle: '#40382d', text: '#f5eedf', textSecondary: '#d9ceba', textMuted: '#bfb29c',
    border: '#746854', borderStrong: '#b7a78d', primary: '#efb19e', primaryFg: '#401810', primaryHover: '#f7cbbc', primaryActive: '#ffe0d5', focus: '#f0bf79',
    selected: '#59432b', selectedFg: '#fff1d5', successBg: '#29371f', successFg: '#c0dba5', successBorder: '#92b873',
    warningBg: '#443519', warningFg: '#eed398', warningBorder: '#c6a259', errorBg: '#482821', errorFg: '#f1b8aa', errorBorder: '#df9584',
    infoBg: '#263a3e', infoFg: '#b9d8dd', infoBorder: '#84afb6', danger: '#df9584', dangerFg: '#35130c', dangerHover: '#f1b8aa',
    bodyFont: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif", headingFont: "Georgia, 'Times New Roman', serif",
    radius: '2px', shadow: '0 4px 0 rgb(0 0 0 / 0.25)',
  }), { 'line-height-normal': '1.6', 'font-size-md': '16px', 'letter-spacing-tight': '-0.015em' }),
};
