import {
  TOKEN_CONTRACT_VERSION,
  assertCompatibleContract,
  validateThemeDefinition,
  type ColorMode,
  type ModePreference,
  type ThemeDefinition,
  type ThemePlugin,
  type TokenValues,
} from '@omni-ui/token-contract';

export const THEME_STORAGE_KEY = 'om.theme-preferences.v1';
const ATTRIBUTE = 'data-om-theme';

export interface ThemeState {
  themeId: string;
  modePreference: ModePreference;
  resolvedMode: ColorMode;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ThemeControllerOptions {
  root: HTMLElement;
  initialThemeId: string;
  plugins: ThemePlugin[];
  storage?: StorageLike | null;
  window?: Window | null;
  document?: Document | null;
}

function isPreference(value: unknown): value is { themeId: string; modePreference: ModePreference } {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.themeId === 'string' &&
    (item.modePreference === 'light' || item.modePreference === 'dark' || item.modePreference === 'system')
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Framework-free, race-safe theme loader. No browser globals are read at module evaluation. */
export class ThemeController {
  private readonly root: HTMLElement;
  private readonly plugins = new Map<string, ThemePlugin>();
  private readonly definitions = new Map<string, ThemeDefinition>();
  private readonly listeners = new Set<(state: ThemeState) => void>();
  private readonly storage: StorageLike | null;
  private readonly win: Window | null;
  private readonly doc: Document | null;
  private readonly style: HTMLStyleElement | null;
  private readonly initialThemeId: string;
  private requestId = 0;
  private destroyed = false;
  private media: MediaQueryList | null = null;
  private state: ThemeState;

  constructor(options: ThemeControllerOptions) {
    if (!options.root) throw new Error('[core] A designated theme root is required.');
    this.root = options.root;
    this.initialThemeId = options.initialThemeId;
    this.storage = options.storage === undefined ? this.safeStorage(options.window ?? null) : options.storage;
    this.win = options.window ?? (typeof window === 'undefined' ? null : window);
    this.doc = options.document ?? (typeof document === 'undefined' ? null : document);
    for (const plugin of options.plugins) this.register(plugin);
    if (!this.plugins.has(options.initialThemeId)) {
      throw new Error(`[core] Initial theme "${options.initialThemeId}" is not registered.`);
    }
    this.state = {
      themeId: options.initialThemeId,
      modePreference: 'system',
      resolvedMode: 'light',
      status: 'idle',
      error: null,
    };
    this.root.setAttribute('data-om-theme-root', '');
    this.style = this.doc?.createElement('style') ?? null;
    if (this.style) {
      this.style.setAttribute('data-om-theme-tokens', '');
      this.doc?.head.append(this.style);
    }
    this.onMediaChange = this.onMediaChange.bind(this);
    this.onStorage = this.onStorage.bind(this);
  }

  getState = (): ThemeState => ({ ...this.state });

  subscribe = (listener: (state: ThemeState) => void): (() => void) => {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  };

  register(plugin: ThemePlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`[core] Duplicate theme ID "${plugin.id}". IDs must be unique.`);
    }
    if (!/^[a-z][a-z0-9-]+$/.test(plugin.id)) {
      throw new Error(`[core] Invalid theme ID "${plugin.id}". Use lowercase letters, numbers and hyphens.`);
    }
    if (!plugin.name || !plugin.version || typeof plugin.load !== 'function') {
      throw new Error(`[core] Theme "${plugin.id}" needs a name, version and load() function.`);
    }
    assertCompatibleContract(plugin.contractVersion, plugin.id);
    if (!plugin.modes.includes('light') || !plugin.modes.includes('dark')) {
      throw new Error(`[core] Theme "${plugin.id}" must support both light and dark modes.`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  async initialize(): Promise<ThemeState> {
    this.media = this.win?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
    this.media?.addEventListener?.('change', this.onMediaChange);
    this.win?.addEventListener?.('storage', this.onStorage);
    let preference = { themeId: this.initialThemeId, modePreference: 'system' as ModePreference };
    try {
      const raw = this.storage?.getItem(THEME_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!isPreference(parsed)) throw new Error('Stored theme preferences have an invalid shape.');
        if (!this.plugins.has(parsed.themeId)) {
          throw new Error(`Stored theme "${parsed.themeId}" is not registered.`);
        }
        preference = { themeId: parsed.themeId, modePreference: parsed.modePreference };
      }
    } catch (error) {
      this.patch({ error: `[core] Ignoring saved preferences: ${errorMessage(error)}` });
    }
    this.patch({ modePreference: preference.modePreference, resolvedMode: this.resolveMode(preference.modePreference) });
    return this.setTheme(preference.themeId);
  }

  async setTheme(themeId: string): Promise<ThemeState> {
    const plugin = this.plugins.get(themeId);
    if (!plugin) {
      const error = `[core] Cannot select unregistered theme "${themeId}". Register its plugin first.`;
      this.patch({ status: 'error', error });
      throw new Error(error);
    }
    const request = ++this.requestId;
    this.patch({ status: 'loading', error: null });
    try {
      let definition = this.definitions.get(themeId);
      if (!definition) {
        const loaded = await plugin.load();
        definition = validateThemeDefinition(loaded, themeId);
        if (request !== this.requestId || this.destroyed) return this.getState();
        this.definitions.set(themeId, definition);
      }
      if (request !== this.requestId || this.destroyed) return this.getState();
      this.apply(themeId, definition[this.state.resolvedMode]);
      this.patch({ themeId, status: 'ready', error: null });
      this.persist();
      return this.getState();
    } catch (error) {
      if (request !== this.requestId || this.destroyed) return this.getState();
      const message = `[core] Failed to load "${themeId}": ${errorMessage(error)}. Keeping "${this.state.themeId}".`;
      this.patch({ status: 'error', error: message });
      throw new Error(message);
    }
  }

  setModePreference(modePreference: ModePreference): void {
    if (!['light', 'dark', 'system'].includes(modePreference)) {
      throw new Error(`[core] Invalid mode preference "${modePreference}".`);
    }
    const resolvedMode = this.resolveMode(modePreference);
    this.patch({ modePreference, resolvedMode, error: null });
    const definition = this.definitions.get(this.state.themeId);
    if (definition) this.apply(this.state.themeId, definition[resolvedMode]);
    this.persist();
  }

  destroy(): void {
    this.destroyed = true;
    this.requestId += 1;
    this.media?.removeEventListener?.('change', this.onMediaChange);
    this.win?.removeEventListener?.('storage', this.onStorage);
    this.listeners.clear();
    this.style?.remove();
  }

  private resolveMode(preference: ModePreference): ColorMode {
    return preference === 'system' ? (this.media?.matches ? 'dark' : 'light') : preference;
  }

  private apply(themeId: string, tokens: TokenValues): void {
    const declarations = Object.entries(tokens)
      .map(([name, value]) => `  --${name}: ${value};`)
      .join('\n');
    if (this.style) {
      this.style.textContent = `[${ATTRIBUTE}-root][${ATTRIBUTE}="${themeId}"] {\n${declarations}\n}`;
    }
    this.root.setAttribute(ATTRIBUTE, themeId);
    this.root.setAttribute('data-om-mode', this.state.resolvedMode);
    this.root.style.colorScheme = this.state.resolvedMode;
  }

  private persist(): void {
    if (this.state.status !== 'ready') return;
    try {
      this.storage?.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ themeId: this.state.themeId, modePreference: this.state.modePreference }),
      );
    } catch (error) {
      this.patch({ error: `[core] Preferences could not be saved: ${errorMessage(error)}` });
    }
  }

  private onMediaChange(): void {
    if (this.state.modePreference !== 'system') return;
    const resolvedMode = this.resolveMode('system');
    this.patch({ resolvedMode });
    const definition = this.definitions.get(this.state.themeId);
    if (definition) this.apply(this.state.themeId, definition[resolvedMode]);
  }

  private onStorage(event: StorageEvent): void {
    if (event.key !== THEME_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed: unknown = JSON.parse(event.newValue);
      if (!isPreference(parsed) || !this.plugins.has(parsed.themeId)) {
        throw new Error('Ignoring invalid preferences from another tab.');
      }
      this.patch({
        modePreference: parsed.modePreference,
        resolvedMode: this.resolveMode(parsed.modePreference),
      });
      void this.setTheme(parsed.themeId).catch(() => undefined);
    } catch (error) {
      this.patch({ error: errorMessage(error) });
    }
  }

  private patch(update: Partial<ThemeState>): void {
    this.state = { ...this.state, ...update };
    for (const listener of this.listeners) listener(this.getState());
  }

  private safeStorage(win: Window | null): StorageLike | null {
    try {
      return win?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}

export { TOKEN_CONTRACT_VERSION };
export type { ColorMode, ModePreference, ThemeDefinition, ThemePlugin, TokenValues };
