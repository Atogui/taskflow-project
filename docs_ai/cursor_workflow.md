## Flujo de trabajo con Cursor (resumen)

Durante el desarrollo de **TaskFlow** he utilizado Cursor como apoyo para iterar rápido sobre la UI y refactorizar el JavaScript de forma incremental, validando cada mejora antes de pasar a la siguiente.

### 1) Comprensión y explicación del código
- Se revisó y explicó el funcionamiento de `renderTareas()`: render del listado a partir del array de tareas, aplicación de filtros/búsqueda, y conexión de eventos (editar/completar/eliminar).

### 2) UI/estética (sin perder legibilidad)
- Se cambió el fondo general a un **gradiente oscuro** con buen contraste para lectura.
- Se mejoró la legibilidad de:
  - **Inputs** (fondo claro semitransparente y placeholder legible).
  - **Tarjetas de tareas** (estilo “card” con opacidad/borde y blur sutil).
  - **Iconos de editar/eliminar** (se eliminó el fondo blanco y se ajustaron colores + hover).

### 3) Responsividad y UX
- Se identificaron problemas de overflow en móviles (por `min-w` y grandes paddings) y se ajustó el layout:
  - Estructura responsive con `flex-col` en pequeño y `lg:flex-row`.
  - Reducción de paddings en pantallas pequeñas.
  - Botones adaptables con `flex-wrap` donde era necesario.
- Se ajustaron los botones “Completar todas” y “Eliminar completadas” para que:
  - En móvil estén en columna y a ancho completo.
  - En pantallas mayores no queden excesivamente separados (gap controlado).

### 4) Correcciones funcionales
- Se corrigió un bug en el que las **estadísticas no se actualizaban** al eliminar tareas completadas cuando la lista quedaba vacía (las stats ahora se recalculan siempre al renderizar).

### 5) Mejora de mantenibilidad del JavaScript (refactor por pasos)
- **Paso 1**: consistencia y robustez del filtro (se pasó a `data-filter` y se limpiaron variables sin uso).
- **Paso 2**: se añadieron anotaciones **JSDoc** (incluyendo un `@typedef` de `Task` y docs de funciones).
- **Paso 3**: validaciones y robustez:
  - `trim()` coherente al crear/editar.
  - impedir títulos vacíos al editar (restaura el anterior).
  - `cargarTareas()` más resistente ante localStorage corrupto.
- **Paso 4**: separación de responsabilidades en funciones pequeñas (filtrado / creación de nodo / eventos).
- **Paso 5**: **event delegation** en la lista (menos listeners y mejor rendimiento).

### 6) Reestructuración del proyecto (Paso 6)
- Se separó el código en una carpeta `src/` para organizar responsabilidades:
  - `src/storage.js`: carga/guardado en localStorage.
  - `src/state.js`: estado y lógica pura (crear tarea y filtrar).
  - `src/ui.js`: render, stats, eventos y delegación.
  - `src/main.js`: arranque y referencias del DOM.
- Se actualizó `index.html` para cargar estos scripts en orden.

### 7) Accesibilidad y detalles finales (Paso 7)
- Se cambió `lang` a `es`, se actualizó el `<title>`, y se añadieron `aria-label` a botones de editar/eliminar para mejorar accesibilidad.