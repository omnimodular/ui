import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#f3f0f8', surface: '#ffffff', raised: '#ffffff', subtle: '#e7dff1', text: '#1c1426', textSecondary: '#4b3b5c', textMuted: '#645473',
    border: '#a998ba', borderStrong: '#5f4679', primary: '#5b21b6', primaryFg: '#ffffff', primaryHover: '#4c1d95', primaryActive: '#39136f', focus: '#a000b8',
    selected: '#ead7ff', selectedFg: '#4c1d95', successBg: '#d2f8e7', successFg: '#075e46', successBorder: '#07865f',
    warningBg: '#fff0bd', warningFg: '#784200', warningBorder: '#a76100', errorBg: '#ffe0e8', errorFg: '#a30f3d', errorBorder: '#a30f3d',
    infoBg: '#dcf5ff', infoFg: '#075c78', infoBorder: '#007a9e', bodyFont: "ui-monospace, 'SFMono-Regular', Consolas, monospace",
    headingFont: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", radius: '0px', borderWidth: '1px',
    shadow: '4px 4px 0 #7e22ce', duration: '90ms',
  }), { 'letter-spacing-wide': '0.12em', 'radius-full': '0px' }),
  dark: createThemeTokens(definePalette({
    page: '#090812', surface: '#151122', raised: '#1e1730', subtle: '#271b39', text: '#f6efff', textSecondary: '#d4c2e8', textMuted: '#b8a5ca',
    border: '#72528d', borderStrong: '#c055dc', primary: '#00e5ff', primaryFg: '#041013', primaryHover: '#7df2ff', primaryActive: '#c0f9ff', focus: '#ff5bde',
    selected: '#42205c', selectedFg: '#ffe1fa', successBg: '#103a31', successFg: '#73fbd3', successBorder: '#20dfaa',
    warningBg: '#46320c', warningFg: '#ffe083', warningBorder: '#ffc400', errorBg: '#481327', errorFg: '#ffadc6', errorBorder: '#ff4f8b',
    infoBg: '#0d3442', infoFg: '#9aedff', infoBorder: '#00d9ff', danger: '#ff4f8b', dangerFg: '#310717', dangerHover: '#ff91b5',
    bodyFont: "ui-monospace, 'SFMono-Regular', Consolas, monospace", headingFont: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    radius: '0px', shadow: '4px 4px 0 #7b2cbf, 0 0 18px rgb(0 229 255 / 0.2)', duration: '90ms',
  }), { 'letter-spacing-wide': '0.12em', 'radius-full': '0px' }),
};
