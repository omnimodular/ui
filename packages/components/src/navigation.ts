export interface NavigationItem {
  id: string;
  label: string;
}

/** Wires semantic navigation buttons and a mobile disclosure without a framework. */
export function createNavigation(
  navigation: HTMLElement,
  toggle: HTMLButtonElement,
  onNavigate: (id: string) => void,
): () => void {
  const abort = new AbortController();
  const { signal } = abort;
  const panelId = toggle.getAttribute('aria-controls');
  const panel = (panelId ? navigation.ownerDocument.getElementById(panelId) : null) ?? navigation;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('is-open', !expanded);
  }, { signal });
  navigation.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-nav-id]');
    if (!button) return;
    navigation.querySelectorAll('[data-nav-id]').forEach((item) => item.removeAttribute('aria-current'));
    button.setAttribute('aria-current', 'page');
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    onNavigate(button.dataset.navId ?? '');
  }, { signal });
  return () => abort.abort();
}
