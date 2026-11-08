import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#fff8ec', surface: '#ffffff', raised: '#ffffff', subtle: '#f3e9ff', text: '#272033', textSecondary: '#4f435f', textMuted: '#685a77',
    border: '#b6a5c7', borderStrong: '#5d4678', primary: '#5b32c9', primaryFg: '#ffffff', primaryHover: '#45249f', primaryActive: '#321875', focus: '#c33c00',
    selected: '#ffe07a', selectedFg: '#3f2b00', successBg: '#d6f3dc', successFg: '#236037', successBorder: '#3b8c53',
    warningBg: '#ffebad', warningFg: '#6d4500', warningBorder: '#a36a00', errorBg: '#ffe0df', errorFg: '#a12727', errorBorder: '#a12727',
    infoBg: '#dceeff', infoFg: '#205b8a', infoBorder: '#377ead', radius: '18px', borderWidth: '2px', shadow: '5px 5px 0 #e2b500', duration: '220ms',
  }), { 'radius-sm': '8px', 'radius-lg': '28px', 'motion-easing-enter': 'cubic-bezier(0.34, 1.56, 0.64, 1)', 'letter-spacing-tight': '-0.04em' }),
  dark: createThemeTokens(definePalette({
    page: '#1d1529', surface: '#2a1e39', raised: '#372747', subtle: '#413050', text: '#fff8ee', textSecondary: '#e0cee9', textMuted: '#c4afcf',
    border: '#816894', borderStrong: '#c3a4d7', primary: '#ffd23f', primaryFg: '#302400', primaryHover: '#ffe382', primaryActive: '#fff0ba', focus: '#ff8b69',
    selected: '#624180', selectedFg: '#fff1ff', successBg: '#203e2c', successFg: '#a4e5b5', successBorder: '#67bd7e',
    warningBg: '#473814', warningFg: '#f5db8c', warningBorder: '#d5ae45', errorBg: '#4a2427', errorFg: '#ffb5b1', errorBorder: '#ed8c87',
    infoBg: '#203c54', infoFg: '#b3ddf9', infoBorder: '#75b6dd', danger: '#ed8c87', dangerFg: '#380d0b', dangerHover: '#ffb5b1',
    radius: '18px', borderWidth: '2px', shadow: '5px 5px 0 #875fce', duration: '220ms',
  }), { 'radius-sm': '8px', 'radius-lg': '28px', 'motion-easing-enter': 'cubic-bezier(0.34, 1.56, 0.64, 1)', 'letter-spacing-tight': '-0.04em' }),
};
