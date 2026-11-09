import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DialogController, TableController, createNavigation } from '@omni-ui/components';

describe('native HTML behavior controllers', () => {
  it('preserves desktop folding through mobile disclosure and removes resize listeners', () => {
    const media = Object.assign(new EventTarget(), { matches: false });
    vi.spyOn(window, 'matchMedia').mockReturnValue(media as MediaQueryList);
    document.body.innerHTML = '<div id="shell"><button id="mobile" aria-controls="panel"></button><aside id="panel"><button id="fold"></button><nav><button data-nav-id="one">One</button></nav></aside></div>';
    const shell = document.querySelector<HTMLElement>('#shell')!;
    const mobile = document.querySelector<HTMLButtonElement>('#mobile')!;
    const fold = document.querySelector<HTMLButtonElement>('#fold')!;
    const cleanup = createNavigation(document.querySelector('nav')!, mobile, vi.fn(), { shell, collapsible: true, initialCollapsed: true, collapseToggle: fold });
    expect(shell.dataset.omCollapsed).toBe('true');
    media.matches = true; media.dispatchEvent(new Event('change'));
    expect(shell.dataset.omCollapsed).toBe('false');
    expect(fold.hidden).toBe(true);
    mobile.click();
    const item = document.querySelector<HTMLButtonElement>('[data-nav-id]')!;
    expect(document.activeElement).toBe(item);
    item.focus(); item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.activeElement).toBe(mobile);
    expect(mobile.getAttribute('aria-expanded')).toBe('false');
    media.matches = false; media.dispatchEvent(new Event('change'));
    expect(shell.dataset.omCollapsed).toBe('true');
    expect(document.activeElement).toBe(item);
    cleanup();
    media.matches = true; media.dispatchEvent(new Event('change'));
    expect(shell.dataset.omCollapsed).toBe('true');
  });
  it('focuses the current page rather than the first item when opening and resizing', () => {
    const media = Object.assign(new EventTarget(), { matches: true });
    vi.spyOn(window, 'matchMedia').mockReturnValue(media as MediaQueryList);
    document.body.innerHTML = '<div id="shell"><button id="mobile" aria-controls="panel"></button><aside id="panel"><nav><button data-nav-id="one">One</button><button data-nav-id="two" aria-current="page">Two</button></nav></aside></div>';
    const mobile = document.querySelector<HTMLButtonElement>('#mobile')!;
    const current = document.querySelector('[aria-current]')!;
    const cleanup = createNavigation(document.querySelector('nav')!, mobile, vi.fn(), { shell: document.querySelector('#shell')! });
    mobile.click();
    expect(document.activeElement).toBe(current);
    mobile.focus();
    media.matches = false; media.dispatchEvent(new Event('change'));
    expect(document.activeElement).toBe(current);
    cleanup();
  });
  it('folds only when enabled and reports changes without storing preferences', async () => {
    document.body.innerHTML = '<div id="shell"><button id="mobile" aria-controls="panel"></button><aside id="panel"><button id="fold"></button><nav><button data-nav-id="one">One</button></nav></aside></div>';
    const shell = document.querySelector<HTMLElement>('#shell')!;
    const fold = document.querySelector<HTMLButtonElement>('#fold')!;
    const changed = vi.fn();
    const cleanup = createNavigation(document.querySelector('nav')!, document.querySelector<HTMLButtonElement>('#mobile')!, vi.fn(), { shell, collapsible: true, collapseToggle: fold, onCollapsedChange: changed });
    fold.click();
    expect(changed).toHaveBeenCalledWith(true);
    expect(fold.getAttribute('aria-expanded')).toBe('false');
    cleanup(); fold.click();
    expect(changed).toHaveBeenCalledTimes(1);
    const destroy = createNavigation(document.querySelector('nav')!, document.querySelector<HTMLButtonElement>('#mobile')!, vi.fn(), { shell, layout: 'top', collapsible: true, collapseToggle: fold });
    expect(fold.hidden).toBe(true);
    expect(shell.dataset.omNavigation).toBe('top');
    destroy();
  });
  it('opens a named dialog, focuses its initial control, closes and restores focus', async () => {
    const user = userEvent.setup();
    document.body.innerHTML = '<button id="trigger">Open</button><dialog aria-label="Example"><input autofocus /><button id="close">Close</button></dialog>';
    const trigger = document.querySelector<HTMLButtonElement>('#trigger')!;
    trigger.focus();
    const controller = new DialogController(document.querySelector('dialog')!, { onClose: vi.fn() });
    controller.open();
    expect(controller.dialog.open).toBe(true);
    expect(document.activeElement).toBe(controller.dialog.querySelector('input'));
    await user.click(document.querySelector('#close')!);
    controller.close();
    expect(controller.dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    controller.destroy();
  });

  it('supports Escape dismissal through native dialog cancel behavior', () => {
    document.body.innerHTML = '<dialog aria-label="Example"><button>Close</button></dialog>';
    const dialog = document.querySelector<HTMLDialogElement>('dialog')!;
    const controller = new DialogController(dialog);
    controller.open();
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    if (!cancel.defaultPrevented) controller.close();
    expect(dialog.open).toBe(false);
    controller.destroy();
  });

  it('sorts table rows, exposes aria-sort, edits rows, and renders an empty state', async () => {
    const user = userEvent.setup();
    document.body.innerHTML = '<table></table>';
    const onEdit = vi.fn();
    const rows = [{ name: 'Zulu', status: 'Done' }, { name: 'Alpha', status: 'To do' }];
    const table = new TableController(document.querySelector('table')!, {
      columns: [{ key: 'name', label: 'Name', sortable: true }, { key: 'status', label: 'Status', badge: true }], rows, onEdit,
    });
    const originalSort = document.querySelector('[data-sort-key="name"]')!;
    await user.click(originalSort);
    expect(document.activeElement).not.toBe(originalSort);
    expect((document.activeElement as HTMLElement).dataset.sortKey).toBe('name');
    expect(document.querySelector('th')!.getAttribute('aria-sort')).toBe('ascending');
    expect(document.querySelector('tbody td')!.textContent).toBe('Alpha');
    await user.click(document.querySelector('[data-edit-index]')!);
    expect(onEdit).toHaveBeenCalledWith(rows[1]);
    table.setRows([]);
    expect(document.querySelector('td')!.textContent).toMatch(/no records/i);
    table.destroy();
  });

  it('navigates, updates current page, toggles mobile navigation and cleans up', async () => {
    const user = userEvent.setup();
    document.body.innerHTML = '<button id="toggle" aria-expanded="false" aria-controls="sidebar"></button><aside id="sidebar"><nav><button data-nav-id="one">One</button><button data-nav-id="two">Two</button></nav></aside>';
    const navigate = vi.fn();
    const cleanup = createNavigation(document.querySelector('nav')!, document.querySelector('#toggle')!, navigate);
    await user.click(document.querySelector('#toggle')!);
    expect(document.querySelector('aside')!.classList.contains('is-open')).toBe(true);
    await user.click(document.querySelector('[data-nav-id="two"]')!);
    expect(navigate).toHaveBeenCalledWith('two');
    expect(document.querySelector('[data-nav-id="two"]')!.getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('aside')!.classList.contains('is-open')).toBe(false);
    cleanup();
    await user.click(document.querySelector('[data-nav-id="one"]')!);
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
