# TaskFlow

Aplicación web sencilla para **gestión de tareas** (vanilla JavaScript) con persistencia en el navegador.

## Funcionalidades

- **CRUD de tareas**: crear, editar título, marcar como completada, eliminar.
- **Filtros**: todas / pendientes / completadas.
- **Búsqueda**: filtra por texto.
- **Estadísticas**: total, pendientes y completadas.
- **Fechas y recordatorios**:
  - **Fecha límite** por tarea (indicador de “próxima” o “vencida”).
  - **Recordatorio** (usa `Notification` si hay permisos; si no, fallback con `alert`).
- **Prioridades y etiquetas**:
  - Prioridad **baja / media / alta**.
  - Etiquetas (tags) por tarea (separadas por comas).
  - **Filtrar por etiqueta** y **ordenar** por fecha o prioridad.
- **Deshacer / Rehacer**: historial en memoria para revertir acciones.

## Cómo ejecutar

No requiere instalación ni build.

1. Abre `index.html` en tu navegador (doble click o “Open with Live Server”).
2. Las tareas se guardan automáticamente en `localStorage`.

## Cómo se usa

- **Añadir tarea**: escribe el texto y (opcionalmente) define fecha límite, recordatorio, prioridad y etiquetas.
- **Editar**: botón de lápiz.
- **Eliminar**: botón de “x”.
- **Completar**: checkbox.
- **Recordatorios**: pulsa **“Activar recordatorios”** para solicitar permisos (si el navegador lo soporta).
- **Deshacer/Rehacer**: botones en el panel de estadísticas.

## Ejemplos de uso

- **Crear una tarea simple**
  - Texto: `Estudiar JavaScript`
  - Prioridad: `Media`
  - Etiquetas: *(vacío)*

- **Crear una tarea con fecha límite + recordatorio**
  - Texto: `Entregar práctica DAW`
  - Fecha límite: `2026-04-15`
  - Recordatorio: `2026-04-14 18:00`
  - Prioridad: `Alta`
  - Etiquetas: `daw, entrega`
  - Luego pulsa **“Activar recordatorios”** para permitir notificaciones.

- **Filtrar y ordenar**
  - Filtro: `Pendientes`
  - Filtrar etiqueta: `daw`
  - Ordenar: `Prioridad alta` (muestra primero las tareas `Alta`)

- **Deshacer/Rehacer un borrado**
  - Elimina una tarea con el botón **“x”**
  - Pulsa **“Deshacer”** para recuperarla
  - Pulsa **“Rehacer”** para volver a eliminarla

## Estructura del proyecto

- `index.html`: estructura de la interfaz (formulario, filtros, lista, estadísticas y template de tarea).
- `src/main.js`: arranque; recoge referencias del DOM y llama a `initUI`.
- `src/ui.js`: render + listeners de UI (delegación de eventos).
- `src/state.js`: definición del estado en memoria y helpers (crear tarea, filtrar/ordenar).
- `src/storage.js`: persistencia en `localStorage` + normalización al cargar.
- `src/reminders.js`: programación de recordatorios (notificaciones/fallback).
- `src/history.js`: historial en memoria (undo/redo) basado en snapshots.

## Documentación

- `docs_ai/api.md`: resumen de módulos/funciones internas (API de `window.TaskFlow`) y responsabilidades.

## Notas técnicas

- **Persistencia**: clave de `localStorage` = `tareas`.
- **Compatibilidad recordatorios**:
  - `Notification` requiere HTTPS o `localhost` (en la mayoría de navegadores).
  - Si no hay permisos/soporte, se usa `alert` como fallback.
- **Etiquetas**: se normalizan a minúsculas y sin duplicados.

## Próximas mejoras (ideas)

- Edición de **prioridad/etiquetas/fechas** desde la propia tarea.
- Recordatorios más robustos (reprogramación al reabrir, límites de `setTimeout`).
- Tests para lógica de filtrado/ordenación e historial.
