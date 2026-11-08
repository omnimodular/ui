export type SortDirection = 'ascending' | 'descending';
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  badge?: boolean;
}
export interface TableOptions<T extends Record<string, unknown>> {
  columns: TableColumn[];
  rows: T[];
  emptyMessage?: string;
  rowLabel?: (row: T) => string;
  onEdit?: (row: T) => void;
}

function text(value: unknown): string {
  return value == null ? '' : String(value);
}

/** Accessible native-table renderer with sorting, status badges, actions and empty state. */
export class TableController<T extends Record<string, unknown>> {
  private rows: T[];
  private sortKey: string | null = null;
  private direction: SortDirection = 'ascending';
  private readonly abort = new AbortController();

  constructor(private readonly table: HTMLTableElement, private readonly options: TableOptions<T>) {
    this.rows = options.rows;
    this.table.addEventListener('click', (event) => {
      const target = event.target as Element;
      const sort = target.closest<HTMLButtonElement>('[data-sort-key]');
      if (sort) {
        const key = sort.dataset.sortKey ?? '';
        if (this.sortKey === key) this.direction = this.direction === 'ascending' ? 'descending' : 'ascending';
        else { this.sortKey = key; this.direction = 'ascending'; }
        this.render();
      }
      const edit = target.closest<HTMLButtonElement>('[data-edit-index]');
      if (edit && this.options.onEdit) {
        const row = this.sortedRows()[Number(edit.dataset.editIndex)];
        if (row) this.options.onEdit(row);
      }
    }, { signal: this.abort.signal });
    this.render();
  }

  setRows(rows: T[]): void {
    this.rows = rows;
    this.render();
  }

  destroy(): void { this.abort.abort(); }

  private sortedRows(): T[] {
    if (!this.sortKey) return [...this.rows];
    const key = this.sortKey;
    const factor = this.direction === 'ascending' ? 1 : -1;
    return [...this.rows].sort((a, b) => text(a[key]).localeCompare(text(b[key]), undefined, { numeric: true }) * factor);
  }

  private render(): void {
    this.table.replaceChildren();
    const caption = document.createElement('caption');
    caption.className = 'visually-hidden';
    caption.textContent = 'Project tasks. Activate column headings to sort.';
    this.table.append(caption);
    const head = this.table.createTHead().insertRow();
    for (const column of this.options.columns) {
      const th = document.createElement('th');
      th.scope = 'col';
      if (column.sortable) {
        th.setAttribute('aria-sort', this.sortKey === column.key ? this.direction : 'none');
        const button = document.createElement('button');
        button.className = 'table-sort';
        button.dataset.sortKey = column.key;
        button.textContent = column.label;
        const indicator = document.createElement('span');
        indicator.setAttribute('aria-hidden', 'true');
        indicator.textContent = this.sortKey === column.key ? (this.direction === 'ascending' ? ' ↑' : ' ↓') : ' ↕';
        button.append(indicator);
        th.append(button);
      } else th.textContent = column.label;
      head.append(th);
    }
    if (this.options.onEdit) {
      const th = document.createElement('th');
      th.scope = 'col'; th.textContent = 'Actions'; head.append(th);
    }
    const body = this.table.createTBody();
    const rows = this.sortedRows();
    if (!rows.length) {
      const cell = body.insertRow().insertCell();
      cell.colSpan = this.options.columns.length + (this.options.onEdit ? 1 : 0);
      cell.className = 'empty-state';
      cell.textContent = this.options.emptyMessage ?? 'No records found.';
      return;
    }
    rows.forEach((row, index) => {
      const tr = body.insertRow();
      for (const column of this.options.columns) {
        const cell = tr.insertCell();
        cell.dataset.label = column.label;
        if (column.badge) {
          const badge = document.createElement('span');
          const value = text(row[column.key]);
          badge.className = `badge ${value.toLowerCase().replaceAll(' ', '-')}`;
          badge.textContent = value;
          cell.append(badge);
        } else cell.textContent = text(row[column.key]);
      }
      if (this.options.onEdit) {
        const button = document.createElement('button');
        button.className = 'secondary small';
        button.dataset.editIndex = String(index);
        button.textContent = 'Edit';
        button.setAttribute('aria-label', `Edit ${this.options.rowLabel?.(row) ?? text(row[this.options.columns[0]?.key ?? ''])}`);
        tr.insertCell().append(button);
      }
    });
  }
}
