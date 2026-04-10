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

Configuración de servidor MCP de GitHub en Cursor
Requisitos previos
Node.js instalado con npm, npx y node accesibles desde terminal.

1. Obtener token de GitHub
github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
Permisos necesarios: repo, read:org, read:user. Copia el token — solo se muestra una vez.

2. Crear .cursor/mcp.json
json{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_tuTokenAqui"
      }
    }
  }
}
Usa .cursor/mcp.json para alcance de proyecto o ~/.cursor/mcp.json para global.

3. Verificar en Cursor
Reinicia Cursor y ve a Settings → Tools & MCP. El servidor debe aparecer con un punto verde y listar las herramientas disponibles (create_issue, create_pull_request, list_commits, etc.).

4. Usar desde el chat
"Lista los issues abiertos de mi repo X"
"Crea un PR con los cambios actuales"
"¿Cuáles fueron los últimos 5 commits de main?"

Casos de uso reales de MCP

Desarrollo de software en equipo
Conectas MCP con GitHub y tu base de datos. El agente puede revisar issues abiertos, leer el esquema de la base de datos y generar migraciones o código directamente en el contexto de tu proyecto real, sin que tengas que copiar y pegar nada manualmente.

Dashboard o app con Notion como backend
Muchos equipos pequeños usan Notion como base de datos ligera. Con un servidor MCP de Notion, el agente puede leer y escribir páginas, crear entradas nuevas o actualizar registros mientras tú le describes los cambios en lenguaje natural desde Cursor.

Automatización de reportes
Conectas MCP a una base de datos Postgres o MySQL con los datos de tu negocio. En lugar de escribir queries a mano, le pides al agente cosas como "dame las ventas del último mes agrupadas por producto" y él genera y ejecuta la consulta directamente.

Monitorización y logs
Con un servidor MCP conectado a tus logs (Datadog, archivos locales, etc.), puedes preguntarle al agente "¿hubo errores 500 en las últimas 2 horas?" mientras estás depurando, sin salir del editor.

Gestión de infraestructura
Con el servidor MCP de Azure o AWS, puedes pedirle al agente que liste tus recursos cloud, revise configuraciones o incluso ejecute operaciones directamente desde el chat de Cursor mientras desarrollas.

Proyectos personales o freelance
Si gestionas tareas en Trello o Linear, conectas MCP y el agente puede crear tarjetas, mover tareas o actualizar estados mientras codificas, sin cambiar de ventana.