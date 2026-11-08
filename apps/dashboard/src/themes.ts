import type { ThemePlugin } from '@omni-ui/core';
import nordic from '@omni-ui/theme-minimalist-nordic';
import enterprise from '@omni-ui/theme-enterprise-slate';
import cyberpunk from '@omni-ui/theme-cyberpunk-neon';
import clarity from '@omni-ui/theme-high-contrast-clarity';
import pastel from '@omni-ui/theme-pastel-soft';
import editorial from '@omni-ui/theme-editorial-serif';
import botanical from '@omni-ui/theme-botanical-earth';
import ocean from '@omni-ui/theme-ocean-glass';
import terminal from '@omni-ui/theme-retro-terminal';
import playful from '@omni-ui/theme-playful-geometric';

/** Only the gallery imports the complete catalog. Manifests are eager; token modules are lazy. */
export const themes: ThemePlugin[] = [
  nordic, enterprise, cyberpunk, clarity, pastel, editorial, botanical, ocean, terminal, playful,
];
