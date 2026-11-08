import '@omni-ui/components/styles.css';
import '@omni-ui/brand-rgb/styles.css';
import './style.css';
import { DialogController, TableController, createNavigation } from '@omni-ui/components';
import { ThemeController, type ModePreference, type ThemeState } from '@omni-ui/core';
import { themes } from './themes';

const TASKS_KEY = 'om.demo-tasks.v1';
type Task = {
  [key: string]: unknown;
  id: string; title: string; description: string; owner: string;
  status: 'To do' | 'In progress' | 'Blocked' | 'Done'; priority: string; points: number; notify: boolean;
};
const samples: Task[] = [
  { id: 'AT-101', title: 'Finalize onboarding flow', description: 'Resolve content and handoff the responsive flow.', owner: 'Maya Chen', status: 'In progress', priority: 'High', points: 5, notify: true },
  { id: 'AT-102', title: 'Audit keyboard navigation', description: 'Verify all primary workflows without a pointer.', owner: 'Noah Williams', status: 'To do', priority: 'High', points: 3, notify: true },
  { id: 'AT-103', title: 'Publish token contract', description: 'Release the versioned semantic token schema.', owner: 'Iris Johansson', status: 'Done', priority: 'Medium', points: 5, notify: false },
  { id: 'AT-104', title: 'Review empty states', description: 'Write helpful empty-state guidance for projects.', owner: 'Leo Martins', status: 'To do', priority: 'Low', points: 2, notify: false },
  { id: 'AT-105', title: 'Measure dark-mode contrast', description: 'Check documented pairs in all ten themes.', owner: 'Maya Chen', status: 'Done', priority: 'Medium', points: 3, notify: true },
  { id: 'AT-106', title: 'Resolve table overflow', description: 'Confirm mobile table behavior at 320 pixels.', owner: 'Noah Williams', status: 'Blocked', priority: 'High', points: 3, notify: true },
  { id: 'AT-107', title: 'Document theme authoring', description: 'Add a worked standalone theme example.', owner: 'Iris Johansson', status: 'In progress', priority: 'Medium', points: 5, notify: false },
  { id: 'AT-108', title: 'Verify bundle isolation', description: 'Inspect the single-theme production artifacts.', owner: 'Leo Martins', status: 'Done', priority: 'Medium', points: 2, notify: false },
];

function query<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required element not found: ${selector}`);
  return element;
}
function validTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return ['id', 'title', 'description', 'owner', 'status', 'priority'].every((key) => typeof task[key] === 'string') &&
    typeof task.points === 'number' && typeof task.notify === 'boolean';
}
function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return structuredClone(samples);
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(validTask)) throw new Error('Saved tasks are invalid; sample data was restored.');
    return parsed;
  } catch (error) {
    console.warn(error);
    return structuredClone(samples);
  }
}
function saveTasks(tasks: Task[]): void {
  try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
  catch { announce('Tasks changed for this session, but browser storage is unavailable.'); }
}
function announce(message: string): void { query('#toast').textContent = message; }

const controller = new ThemeController({
  root: document.body,
  initialThemeId: 'minimalist-nordic',
  plugins: themes,
});
let bootError = '';
try { await controller.initialize(); }
catch (error) { bootError = error instanceof Error ? error.message : String(error); }
query<HTMLDivElement>('#app').hidden = false;
query('#boot-status').remove();

const themeSelect = query<HTMLSelectElement>('#theme-select');
for (const plugin of themes) {
  const option = document.createElement('option');
  option.value = plugin.id;
  option.textContent = plugin.name;
  themeSelect.append(option);
}
function showThemeState(state: ThemeState): void {
  themeSelect.value = state.themeId;
  themeSelect.disabled = state.status === 'loading';
  themeSelect.setAttribute('aria-busy', String(state.status === 'loading'));
  query('#resolved-mode').textContent = `Resolves to ${state.resolvedMode}`;
  const radio = document.querySelector<HTMLInputElement>(`input[name="mode"][value="${state.modePreference}"]`);
  if (radio) radio.checked = true;
  const error = query<HTMLDivElement>('#theme-error');
  error.hidden = !state.error;
  error.textContent = state.error ?? '';
}
const unsubscribe = controller.subscribe(showThemeState);
if (bootError) { query('#theme-error').textContent = bootError; query<HTMLDivElement>('#theme-error').hidden = false; }
themeSelect.addEventListener('change', () => { void controller.setTheme(themeSelect.value).catch(() => undefined); });
query('#mode-control').addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.name === 'mode') controller.setModePreference(input.value as ModePreference);
});

let activeView = 'dashboard';
function showView(id: string): void {
  activeView = id;
  for (const view of document.querySelectorAll<HTMLElement>('[id^="view-"]')) view.hidden = view.id !== `view-${id}`;
  const title = query<HTMLElement>(`#${id}-title`);
  document.title = `Omni UI · ${title.textContent ?? 'Workspace'}`;
}
const destroyNavigation = createNavigation(query('#main-navigation'), query<HTMLButtonElement>('#navigation-toggle'), showView);

let tasks = loadTasks();
let visibleTasks = [...tasks];
const table = new TableController<Task>(query<HTMLTableElement>('#task-table'), {
  columns: [
    { key: 'title', label: 'Task', sortable: true },
    { key: 'owner', label: 'Owner', sortable: true },
    { key: 'status', label: 'Status', sortable: true, badge: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'points', label: 'Points', sortable: true },
  ],
  rows: visibleTasks,
  emptyMessage: 'No tasks match your search. Clear the search or choose another status.',
  rowLabel: (task) => task.title,
  onEdit: openTaskDialog,
});
function renderTasks(): void {
  const search = query<HTMLInputElement>('#task-search').value.trim().toLowerCase();
  const status = query<HTMLSelectElement>('#status-filter').value;
  visibleTasks = tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.owner}`.toLowerCase().includes(search);
    return matchesSearch && (status === 'all' || task.status === status);
  });
  table.setRows(visibleTasks);
  query('#metric-total').textContent = String(tasks.length);
  query('#metric-progress').textContent = String(tasks.filter((task) => task.status === 'In progress').length);
  query('#metric-done').textContent = String(tasks.filter((task) => task.status === 'Done').length);
  query('#metric-points').textContent = String(tasks.filter((task) => task.status !== 'Done').reduce((sum, task) => sum + task.points, 0));
}
query('#task-search').addEventListener('input', renderTasks);
query('#status-filter').addEventListener('change', renderTasks);
renderTasks();

const dialog = new DialogController(query<HTMLDialogElement>('#task-dialog'));
const form = query<HTMLFormElement>('#task-form');
function clearValidation(): void {
  for (const id of ['title', 'owner', 'points']) {
    query(`#task-${id}`).setAttribute('aria-invalid', 'false');
    query<HTMLElement>(`#task-${id}-error`).hidden = true;
  }
}
function openTaskDialog(task?: Task): void {
  form.reset(); clearValidation();
  query<HTMLInputElement>('#task-id').value = task?.id ?? '';
  query<HTMLInputElement>('#task-title').value = task?.title ?? '';
  query<HTMLTextAreaElement>('#task-description').value = task?.description ?? '';
  query<HTMLInputElement>('#task-owner').value = task?.owner ?? '';
  query<HTMLSelectElement>('#task-status').value = task?.status ?? 'To do';
  query<HTMLSelectElement>('#task-priority').value = task?.priority ?? 'Medium';
  query<HTMLInputElement>('#task-points').value = String(task?.points ?? 3);
  query<HTMLInputElement>('#task-notify').checked = task?.notify ?? false;
  query('#task-dialog-title').textContent = task ? `Edit ${task.id}` : 'Create task';
  query('#save-task').textContent = task ? 'Save changes' : 'Create task';
  dialog.open();
}
query('#new-task').addEventListener('click', () => openTaskDialog());
query('#dialog-demo').addEventListener('click', () => openTaskDialog());
query('#close-dialog').addEventListener('click', () => dialog.close());
query('#cancel-dialog').addEventListener('click', () => dialog.close());
form.addEventListener('submit', (event) => {
  event.preventDefault(); clearValidation();
  const title = query<HTMLInputElement>('#task-title').value.trim();
  const owner = query<HTMLInputElement>('#task-owner').value.trim();
  const points = query<HTMLInputElement>('#task-points').valueAsNumber;
  let firstInvalid: HTMLInputElement | null = null;
  const invalidate = (id: string, invalid: boolean) => {
    query(`#task-${id}`).setAttribute('aria-invalid', String(invalid));
    query<HTMLElement>(`#task-${id}-error`).hidden = !invalid;
    if (invalid && !firstInvalid) firstInvalid = query<HTMLInputElement>(`#task-${id}`);
  };
  invalidate('title', title.length < 3); invalidate('owner', !owner); invalidate('points', !Number.isFinite(points) || points < 1 || points > 13);
  const invalidField = firstInvalid as HTMLInputElement | null;
  if (invalidField) { invalidField.focus(); return; }
  const id = query<HTMLInputElement>('#task-id').value;
  const existing = tasks.find((task) => task.id === id);
  const task: Task = {
    id: id || `AT-${Math.max(100, ...tasks.map((item) => Number(item.id.replace(/\D/g, '')) || 100)) + 1}`,
    title, description: query<HTMLTextAreaElement>('#task-description').value.trim(), owner,
    status: query<HTMLSelectElement>('#task-status').value as Task['status'], priority: query<HTMLSelectElement>('#task-priority').value,
    points, notify: query<HTMLInputElement>('#task-notify').checked,
  };
  tasks = existing ? tasks.map((item) => item.id === id ? task : item) : [task, ...tasks];
  saveTasks(tasks); renderTasks(); dialog.close(); announce(existing ? `Updated ${task.id}.` : `Created ${task.id}.`);
});

query<HTMLFormElement>('#showcase-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = query<HTMLInputElement>('#showcase-name');
  const invalid = input.value.trim().length < 3;
  input.setAttribute('aria-invalid', String(invalid));
  query<HTMLElement>('#name-error').hidden = !invalid;
  query('#showcase-output').textContent = invalid ? '' : 'Valid — settings are ready to save.';
  if (invalid) input.focus();
});
query<HTMLButtonElement>('#loading-demo').addEventListener('click', (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Loading';
  window.setTimeout(() => {
    button.disabled = false; button.setAttribute('aria-busy', 'false'); button.textContent = 'Load preview';
    query('#loading-status').textContent = 'Preview loaded. No network request was needed.';
  }, 700);
});

const examples: Record<string, string> = {
  register: `import { ThemeController } from '@omni-ui/core';\nimport nordic from '@omni-ui/theme-minimalist-nordic';\n\nconst themes = new ThemeController({\n  root: document.body,\n  initialThemeId: 'minimalist-nordic',\n  plugins: [nordic],\n});\n\nawait themes.initialize();`,
  theme: `// Register other standalone plugins in plugins: [...]\nawait themes.setTheme('botanical-earth');\n\n// The last valid theme stays active if loading fails.\nconst { themeId, status, error } = themes.getState();`,
  mode: `themes.setModePreference('light');\nthemes.setModePreference('dark');\nthemes.setModePreference('system');\n\nconst { modePreference, resolvedMode } = themes.getState();`,
  tokens: `<!-- Native HTML; classes are only for variants/layout. -->\n<button class="primary">Create project</button>\n\n<style>\n  .project-metric {\n    background: var(--color-surface-bg);\n    color: var(--color-text-primary);\n    border: var(--border-width) solid var(--color-border);\n    border-radius: var(--radius-lg);\n    padding: var(--space-6);\n  }\n</style>`,
};
function selectExample(name: string): void {
  query('#code-example').textContent = examples[name] ?? examples.register!;
  for (const tab of document.querySelectorAll('[role="tab"]')) tab.setAttribute('aria-selected', String((tab as HTMLElement).dataset.example === name));
  query('#code-panel').setAttribute('aria-labelledby', `tab-${name}`);
  query('#copy-status').textContent = '';
}
for (const tab of document.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
  tab.addEventListener('click', () => selectExample(tab.dataset.example ?? 'register'));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(tabs.indexOf(tab) + offset + tabs.length) % tabs.length];
    next?.focus(); selectExample(next?.dataset.example ?? 'register');
  });
}
query('#copy-code').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(query('#code-example').textContent ?? '');
    query('#copy-status').textContent = 'Copied to clipboard.';
  } catch { query('#copy-status').textContent = 'Clipboard unavailable. Select the code to copy it manually.'; }
});
selectExample('register');

window.addEventListener('beforeunload', () => {
  unsubscribe(); destroyNavigation(); table.destroy(); dialog.destroy(); controller.destroy();
}, { once: true });
