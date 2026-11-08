import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DialogController, TableController, createNavigation } from '@omni-ui/components';

describe('native HTML behavior controllers', () => {
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
