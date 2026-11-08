import { createThemeTokens, definePalette, type ThemeDefinition } from '@omni-ui/token-contract';

export const definition: ThemeDefinition = {
  light: createThemeTokens(definePalette({
    page: '#f3f6f7', surface: '#ffffff', raised: '#ffffff', subtle: '#e8eef0',
    text: '#17272e', textSecondary: '#3e535c', textMuted: '#52676f', border: '#b5c3c9', borderStrong: '#70858e',
    primary: '#175cd3', primaryFg: '#ffffff', primaryHover: '#1849a9', primaryActive: '#123b85', focus: '#0b6bcb',
    selected: '#dceafa', selectedFg: '#123b70', disabled: '#e4e9eb', disabledFg: '#5e6d73',
    successBg: '#d1fadf', successFg: '#05603a', successBorder: '#0a7d4d',
    warningBg: '#fef0c7', warningFg: '#7a2e0e', warningBorder: '#b54708',
    errorBg: '#fee4e2', errorFg: '#b42318', errorBorder: '#b42318',
    infoBg: '#e0f2fe', infoFg: '#075985', infoBorder: '#027aa5',
    radius: '7px', shadow: '0 2px 10px rgb(30 50 60 / 0.07)',
  })),
  dark: createThemeTokens(definePalette({
    page: '#10181c', surface: '#19252b', raised: '#213139', subtle: '#24343b',
    text: '#edf5f7', textSecondary: '#c3d1d6', textMuted: '#a9bbc2', border: '#50666f', borderStrong: '#8ba0a9',
    primary: '#91bcff', primaryFg: '#10213d', primaryHover: '#b5d1ff', primaryActive: '#d2e3ff', focus: '#8fc7ff',
    selected: '#233f5d', selectedFg: '#e2efff', disabled: '#2b383e', disabledFg: '#a2b0b6',
    successBg: '#123c2b', successFg: '#8df0bd', successBorder: '#4fd895',
    warningBg: '#49310b', warningFg: '#ffd78a', warningBorder: '#e5a93d',
    errorBg: '#4a191b', errorFg: '#ffb4ab', errorBorder: '#f97066',
    infoBg: '#12334b', infoFg: '#a5d8ff', infoBorder: '#47a3e0',
    danger: '#f97066', dangerFg: '#310b0d', dangerHover: '#ff9b94',
    radius: '7px', shadow: '0 4px 16px rgb(0 0 0 / 0.28)',
  })),
};
