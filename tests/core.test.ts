import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeController, THEME_STORAGE_KEY, type StorageLike } from '@omni-ui/core';
import type { ThemeDefinition, ThemePlugin } from '@omni-ui/token-contract';
import { definition } from '@omni-ui/theme-minimalist-nordic/tokens';

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem = vi.fn((key: string) => this.values.get(key) ?? null);
  setItem = vi.fn((key: string, value: string) => { this.values.set(key, value); });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
function plugin(id: string, load: () => Promise<ThemeDefinition> = () => Promise.resolve(definition)): ThemePlugin {
  return { id, name: id, version: '1.0.0', contractVersion: '1.0.0', modes: ['light', 'dark'], load };
}
function environment() {
  const storage = new MemoryStorage();
  const mediaListeners = new Set<() => void>();
  const media = {
    matches: false,
    addEventListener: vi.fn((_type: string, listener: () => void) => mediaListeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: () => void) => mediaListeners.delete(listener)),
  };
  let storageListener: ((event: StorageEvent) => void) | undefined;
  const win = {
    localStorage: storage,
    matchMedia: vi.fn(() => media),
    addEventListener: vi.fn((type: string, listener: (event: StorageEvent) => void) => { if (type === 'storage') storageListener = listener; }),
    removeEventListener: vi.fn((type: string) => { if (type === 'storage') storageListener = undefined; }),
  } as unknown as Window;
  return {
    storage, media, mediaListeners, win,
    emitMedia(matches: boolean) { media.matches = matches; mediaListeners.forEach((listener) => listener()); },
    emitStorage(value: string) { storageListener?.({ key: THEME_STORAGE_KEY, newValue: value } as StorageEvent); },
  };
}
function setup(env = environment(), plugins = [plugin('alpha')], initialThemeId = 'alpha') {
  const root = document.createElement('div');
  document.body.append(root);
  const controller = new ThemeController({ root, initialThemeId, plugins, window: env.win, storage: env.storage, document });
  return { controller, root, env };
}

beforeEach(() => { document.documentElement.style.colorScheme = ''; window.localStorage.clear(); });

describe('ThemeController', () => {
  it('initializes, resolves system mode, applies scoped tokens and color-scheme', async () => {
    const { controller, root } = setup();
    await controller.initialize();
    expect(controller.getState()).toMatchObject({ themeId: 'alpha', modePreference: 'system', resolvedMode: 'light', status: 'ready' });
    expect(root.dataset.omTheme).toBe('alpha');
    expect(root.style.colorScheme).toBe('');
    expect(root.dataset.omMode).toBe('light');
    const style = document.head.querySelector('style[data-om-theme-tokens]')!;
    expect(style.textContent).toContain(`[data-om-theme-root="${root.dataset.omThemeRoot}"][data-om-theme="alpha"]`);
    expect(style.textContent).toContain('color-scheme: light');
    expect(style.textContent).toContain('--color-action-primary-bg:');
    expect(style.textContent).not.toContain(':root');
    controller.destroy();
  });

  it('uses browser storage by default when window is omitted', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    const controller = new ThemeController({ root, initialThemeId: 'alpha', plugins: [plugin('alpha')], document });
    await controller.initialize();
    controller.setModePreference('dark');
    const saved = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY)!);
    expect(saved).toEqual({ themeId: 'alpha', modePreference: 'dark' });
    controller.destroy();
  });

  it('supports nonce-based CSP and does not require inline color-scheme styles', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    const controller = new ThemeController({
      root, initialThemeId: 'alpha', plugins: [plugin('alpha')], document, styleNonce: 'test-nonce',
    });
    await controller.initialize();
    const style = document.head.querySelector<HTMLStyleElement>('style[data-om-theme-tokens]')!;
    expect(style.nonce).toBe('test-nonce');
    expect(root.style.colorScheme).toBe('');
    expect(style.textContent).toContain('color-scheme: light');
    controller.destroy();
  });

  it('isolates identical theme IDs on independent controller roots', async () => {
    const first = setup();
    const second = setup();
    await Promise.all([first.controller.initialize(), second.controller.initialize()]);
    second.controller.setModePreference('dark');
    expect(first.root.dataset.omThemeRoot).not.toBe(second.root.dataset.omThemeRoot);
    const firstStyle = document.head.querySelector(`[data-om-theme-tokens="${first.root.dataset.omThemeRoot}"]`)!;
    const secondStyle = document.head.querySelector(`[data-om-theme-tokens="${second.root.dataset.omThemeRoot}"]`)!;
    expect(firstStyle.textContent).toContain(`[data-om-theme-root="${first.root.dataset.omThemeRoot}"]`);
    expect(firstStyle.textContent).toContain(definition.light['color-page-bg']);
    expect(firstStyle.textContent).toContain('color-scheme: light');
    expect(secondStyle.textContent).toContain(`[data-om-theme-root="${second.root.dataset.omThemeRoot}"]`);
    expect(secondStyle.textContent).toContain(definition.dark['color-page-bg']);
    expect(secondStyle.textContent).toContain('color-scheme: dark');
    first.controller.destroy(); second.controller.destroy();
  });

  it('resolves explicit modes and reacts to OS changes only in system mode', async () => {
    const { controller, root, env } = setup();
    await controller.initialize();
    env.emitMedia(true);
    expect(controller.getState().resolvedMode).toBe('dark');
    expect(root.dataset.omMode).toBe('dark');
    expect(document.head.querySelector('style[data-om-theme-tokens]')!.textContent).toContain('color-scheme: dark');
    controller.setModePreference('light');
    env.emitMedia(false); env.emitMedia(true);
    expect(controller.getState()).toMatchObject({ modePreference: 'light', resolvedMode: 'light' });
    controller.setModePreference('system');
    expect(controller.getState().resolvedMode).toBe('dark');
    controller.destroy();
    expect(env.media.removeEventListener).toHaveBeenCalled();
  });

  it('validates and persists preferences and restores valid saved values', async () => {
    const first = setup();
    await first.controller.initialize();
    first.controller.setModePreference('dark');
    const saved = JSON.parse(first.env.storage.values.get(THEME_STORAGE_KEY)!);
    expect(saved).toEqual({ themeId: 'alpha', modePreference: 'dark' });
    first.controller.destroy();
    const second = setup(first.env);
    await second.controller.initialize();
    expect(second.controller.getState()).toMatchObject({ themeId: 'alpha', modePreference: 'dark', resolvedMode: 'dark' });
    second.controller.destroy();
  });

  it('ignores malformed and unregistered saved preferences', async () => {
    for (const saved of ['{broken', JSON.stringify({ themeId: 'ghost', modePreference: 'dark' }), JSON.stringify({ themeId: 4, modePreference: 'sepia' })]) {
      const env = environment(); env.storage.values.set(THEME_STORAGE_KEY, saved);
      const { controller } = setup(env);
      await controller.initialize();
      expect(controller.getState()).toMatchObject({ themeId: 'alpha', modePreference: 'system', status: 'ready' });
      controller.destroy();
    }
  });

  it('survives unavailable storage without failing initialization', async () => {
    const env = environment();
    env.storage.getItem.mockImplementation(() => { throw new Error('denied'); });
    env.storage.setItem.mockImplementation(() => { throw new Error('denied'); });
    const { controller } = setup(env);
    await controller.initialize();
    expect(controller.getState().themeId).toBe('alpha');
    controller.setModePreference('dark');
    expect(controller.getState().error).toContain('could not be saved');
    controller.destroy();
  });

  it('rejects duplicate IDs, incompatible contracts and incomplete modes', () => {
    expect(() => setup(environment(), [plugin('alpha'), plugin('alpha')])).toThrow(/duplicate theme id/i);
    expect(() => setup(environment(), [{ ...plugin('alpha'), contractVersion: '2.0.0' }])).toThrow(/contract 2\.0\.0/);
    expect(() => setup(environment(), [{ ...plugin('alpha'), modes: ['light'] }])).toThrow(/both light and dark/);
  });

  it('keeps the last successful identity and exposes load failures', async () => {
    const broken = plugin('broken', () => Promise.reject(new Error('network unavailable')));
    const { controller, root } = setup(environment(), [plugin('alpha'), broken]);
    await controller.initialize();
    await expect(controller.setTheme('broken')).rejects.toThrow(/network unavailable.*keeping "alpha"/i);
    expect(root.dataset.omTheme).toBe('alpha');
    expect(controller.getState()).toMatchObject({ themeId: 'alpha', status: 'error' });
    expect(controller.getState().error).toContain('broken');
    controller.destroy();
  });

  it('validates loaded tokens before replacing the active theme', async () => {
    const incomplete = plugin('incomplete', () => Promise.resolve({ light: {}, dark: {} } as ThemeDefinition));
    const { controller, root } = setup(environment(), [plugin('alpha'), incomplete]);
    await controller.initialize();
    await expect(controller.setTheme('incomplete')).rejects.toThrow(/missing required tokens/i);
    expect(root.dataset.omTheme).toBe('alpha');
    controller.destroy();
  });

  it('ignores stale resolutions during rapid switching', async () => {
    const slowB = deferred<ThemeDefinition>();
    const slowC = deferred<ThemeDefinition>();
    const b = plugin('beta', () => slowB.promise);
    const c = plugin('gamma', () => slowC.promise);
    const { controller, root } = setup(environment(), [plugin('alpha'), b, c]);
    await controller.initialize();
    const selectB = controller.setTheme('beta');
    const selectC = controller.setTheme('gamma');
    slowB.resolve(definition);
    await selectB;
    expect(root.dataset.omTheme).toBe('alpha');
    slowC.resolve(definition);
    await selectC;
    expect(root.dataset.omTheme).toBe('gamma');
    expect(controller.getState().themeId).toBe('gamma');
    controller.destroy();
  });

  it('synchronizes valid cross-tab preferences and ignores invalid events', async () => {
    const { controller } = setup(environment(), [plugin('alpha'), plugin('beta')]);
    await controller.initialize();
    controller.setModePreference('light');
    controller.destroy();
    const env2 = environment();
    const second = setup(env2, [plugin('alpha'), plugin('beta')]);
    await second.controller.initialize();
    env2.emitStorage(JSON.stringify({ themeId: 'beta', modePreference: 'dark' }));
    await vi.waitFor(() => expect(second.controller.getState().themeId).toBe('beta'));
    expect(second.controller.getState().resolvedMode).toBe('dark');
    env2.emitStorage('{bad');
    expect(second.controller.getState().error).toMatch(/invalid|json/i);
    second.controller.destroy();
  });

  it('unsubscribes listeners and removes media/storage listeners on destroy', async () => {
    const { controller, env } = setup();
    await controller.initialize();
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe(); controller.setModePreference('dark');
    expect(listener).toHaveBeenCalledTimes(1);
    controller.destroy();
    expect(env.mediaListeners.size).toBe(0);
    expect(env.win.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});
