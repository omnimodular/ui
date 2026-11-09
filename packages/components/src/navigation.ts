export interface NavigationItem {
  id: string;
  label: string;
}

export interface NavigationOptions {
  shell: HTMLElement;
  layout?: 'sidebar' | 'top';
  collapsible?: boolean;
  initialCollapsed?: boolean;
  collapseToggle?: HTMLButtonElement;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/** Wires semantic navigation buttons and a mobile disclosure without a framework. */
export function createNavigation(
  navigation: HTMLElement,
  toggle: HTMLButtonElement,
  onNavigate: (id: string) => void,
  options?: NavigationOptions,
): () => void {
  const abort = new AbortController();
  const { signal } = abort;
  const panelId = toggle.getAttribute('aria-controls');
  const panel = (panelId ? navigation.ownerDocument.getElementById(panelId) : null) ?? navigation;
  const media = options ? navigation.ownerDocument.defaultView!.matchMedia('(max-width: 760px)') : null;
  const foldable = options?.layout !== 'top' && options?.collapsible === true;
  if (foldable && !options?.collapseToggle) throw new Error('Collapsible navigation requires collapseToggle.');
  let collapsed = foldable && options?.initialCollapsed === true;
  const focusNavigation = () => {
    const current = navigation.querySelector<HTMLElement>('[data-nav-id][aria-current="page"]');
    (current ?? navigation.querySelector<HTMLElement>('[data-nav-id]'))?.focus();
  };
  const close = () => {
    if (media?.matches && panel.contains(navigation.ownerDocument.activeElement)) toggle.focus();
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
  };
  const render = () => {
    if (!options) return;
    options.shell.dataset.omNavigation = options.layout ?? 'sidebar';
    options.shell.dataset.omCollapsed = String(collapsed && !media?.matches);
    if (options.collapseToggle) {
      options.collapseToggle.hidden = !foldable || Boolean(media?.matches);
      options.collapseToggle.setAttribute('aria-expanded', String(!collapsed));
      options.collapseToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      options.collapseToggle.textContent = collapsed ? '»' : '«';
    }
  };
  options?.collapseToggle?.addEventListener('click', () => {
    if (!foldable) return;
    collapsed = !collapsed; render(); options?.onCollapsedChange?.(collapsed);
  }, { signal });
  const resize = () => {
    close(); render();
    if (!media?.matches && navigation.ownerDocument.activeElement === toggle) {
      focusNavigation();
    }
  };
  media?.addEventListener('change', resize);
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && media?.matches) close();
  }, { signal });
  if (options) { close(); render(); }
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('is-open', !expanded);
    if (!expanded && media?.matches) focusNavigation();
  }, { signal });
  navigation.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-nav-id]');
    if (!button) return;
    navigation.querySelectorAll('[data-nav-id]').forEach((item) => item.removeAttribute('aria-current'));
    button.setAttribute('aria-current', 'page');
    close();
    onNavigate(button.dataset.navId ?? '');
  }, { signal });
  return () => { abort.abort(); media?.removeEventListener('change', resize); };
}
