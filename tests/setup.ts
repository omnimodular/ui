import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
}

afterEach(() => {
  document.body.replaceChildren();
  document.head.querySelectorAll('[data-om-theme-tokens]').forEach((element) => element.remove());
  vi.restoreAllMocks();
});
