## API interna (funciones y módulos)

Este proyecto usa un namespace global `window.TaskFlow` para compartir funciones entre scripts cargados con `<script defer>`.

### `src/storage.js` → `window.TaskFlow.storage`

- **`loadTasks()`**: lee desde `localStorage` (clave `tareas`), normaliza y devuelve un array de tareas.
- **`saveTasks(tasks)`**: serializa y guarda el array de tareas en `localStorage`.

### `src/state.js`

#### `window.TaskFlow.state`

Estado en memoria:

- **`state.tasks`**: array de tareas.
- **`state.activeFilter`**: `"all" | "pending" | "completed"`.
- **`state.activeTag`**: `"all"` o una etiqueta concreta.
- **`state.sortMode`**: `"createdDesc" | "createdAsc" | "priorityDesc" | "priorityAsc"`.

#### `window.TaskFlow.stateApi`

- **`createTask(title)`**: construye una tarea con valores por defecto.
- **`getFilteredTasks(tasks, filter, query, tag, sortMode)`**: filtra por estado, búsqueda y etiqueta, y ordena.

### `src/ui.js` → `window.TaskFlow.ui`

- **`initUI(refs)`**: inicializa listeners y render. `refs` contiene referencias del DOM (form, inputs, lista, botones, etc.).

Funciones internas (no exportadas, pero importantes):

- **`renderTasks()`**: renderiza la lista aplicando filtros/ordenación/búsqueda.
- **`commitTasksChange(mutate)`**: aplica un cambio sobre `state.tasks`, registra snapshot en historial y persiste/renderiza.
- **`syncTagFilterOptions()`**: recalcula el `<select>` de etiquetas a partir de las tareas actuales.

### `src/reminders.js` → `window.TaskFlow.reminders`

- **`requestPermission()`**: solicita permisos para `Notification` (si está disponible).
- **`reschedule(tasks)`**: programa recordatorios en base a `task.reminderAt` (solo mientras la app está abierta).

### `src/history.js` → `window.TaskFlow.history`

Historial en memoria basado en snapshots (deep clone).

- **`reset(snapshot)`**: inicializa el historial.
- **`push(snapshot)`**: añade un snapshot (y vacía redo).
- **`undo()` / `redo()`**: devuelven el snapshot a aplicar (o `null`).
- **`canUndo()` / `canRedo()`**: flags para habilitar/deshabilitar botones.

### `src/main.js`

Bootstrap:

- Lee referencias del DOM.
- Carga tareas con `storage.loadTasks()` en `state.tasks`.
- Llama a `ui.initUI(refs)`.

