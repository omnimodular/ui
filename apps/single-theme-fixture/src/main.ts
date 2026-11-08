import '@omni-ui/components/styles.css';
import '@omni-ui/brand-rgb/styles.css';
import { ThemeController } from '@omni-ui/core';
import nordic from '@omni-ui/theme-minimalist-nordic';

const controller = new ThemeController({
  root: document.body,
  initialThemeId: 'minimalist-nordic',
  plugins: [nordic],
  storage: null,
});
await controller.initialize();
document.querySelector('#theme-output')!.textContent = `Loaded: ${controller.getState().themeId}`;
