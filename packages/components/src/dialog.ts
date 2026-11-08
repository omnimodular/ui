const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

function activeElement(doc: Document): HTMLElement | null {
  let active = doc.activeElement;
  while (active instanceof HTMLElement && active.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active instanceof HTMLElement ? active : null;
}

/** Adds predictable initial focus and restoration to the native dialog element. */
export class DialogController {
  private returnFocus: HTMLElement | null = null;
  private readonly onClose = () => {
    if (this.returnFocus?.isConnected) this.returnFocus.focus();
    this.returnFocus = null;
    this.options.onClose?.();
  };

  constructor(
    readonly dialog: HTMLDialogElement,
    private readonly options: { onClose?: () => void } = {},
  ) {
    if (!dialog.hasAttribute('aria-label') && !dialog.hasAttribute('aria-labelledby')) {
      throw new Error('[components] Dialog requires aria-label or aria-labelledby.');
    }
    dialog.addEventListener('close', this.onClose);
  }

  open(): void {
    if (this.dialog.open) return;
    this.returnFocus = activeElement(this.dialog.ownerDocument);
    this.dialog.showModal();
    const target = this.dialog.querySelector<HTMLElement>('[autofocus]') ?? this.dialog.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
  }

  close(): void {
    this.dialog.close();
  }

  destroy(): void {
    this.dialog.removeEventListener('close', this.onClose);
  }
}
