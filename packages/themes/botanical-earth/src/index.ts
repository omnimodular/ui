import type { ThemeManifest, ThemePlugin } from '@omni-ui/token-contract';
import { applyBrandTheme } from '@omni-ui/brand-rgb';

export const manifest: ThemeManifest = { id: 'botanical-earth', name: 'Botanical Earth', version: '1.0.0', contractVersion: '1.0.0', modes: ['light', 'dark'] };
export const theme: ThemePlugin = {
  ...manifest,
  load: () => import('./tokens').then((module) => applyBrandTheme(module.definition, { chroma: 0.5 })),
};
export default theme;
