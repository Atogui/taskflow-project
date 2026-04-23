// Namespace
window.TaskFlow = window.TaskFlow || {};

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {boolean} completed
 * @property {string} createdAt
 * @property {string | null} dueDate - Fecha límite (YYYY-MM-DD) o null
 * @property {string | null} reminderAt - Recordatorio (datetime-local) o null
 * @property {"low"|"medium"|"high"} priority
 * @property {string[]} tags
 */

(() => {
  /**
   * Estado global de la app.
   * @type {{
   *  tasks: Task[],
   *  activeFilter: "all"|"pending"|"completed",
   *  activeTag: string,
   *  sortMode: "createdDesc"|"createdAsc"|"priorityDesc"|"priorityAsc"
   * }}
   */
  const state = {
    tasks: [],
    activeFilter: "all",
    activeTag: "all",
    sortMode: "createdDesc",
  };

  /**
   * Crea una nueva tarea.
   * @param {string} title
   * @returns {Task}
   */
  function createTask(title) {
    return {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: null,
      reminderAt: null,
      priority: "medium",
      tags: [],
    };
  }

  /**
   * Devuelve las tareas filtradas por estado/búsqueda/etiqueta y ordenadas.
   * @param {Task[]} tasks
   * @param {"all"|"pending"|"completed"} filter
   * @param {string} query
   * @param {string} tag
   * @param {"createdDesc"|"createdAsc"|"priorityDesc"|"priorityAsc"} sortMode
   * @returns {Task[]}
   */
  function getFilteredTasks(tasks, filter, query, tag, sortMode) {
    let result = tasks;

    if (filter === "completed") result = result.filter((t) => t.completed);
    if (filter === "pending") result = result.filter((t) => !t.completed);

    const q = query.trim().toLowerCase();
    if (q) result = result.filter((t) => t.title.toLowerCase().includes(q));

    const activeTag = String(tag || "").trim().toLowerCase();
    if (activeTag && activeTag !== "all") {
      result = result.filter((t) =>
        Array.isArray(t.tags)
          ? t.tags.some((x) => String(x).toLowerCase() === activeTag)
          : false
      );
    }

    const mode = sortMode || "createdDesc";

    const priorityRank = (p) => (p === "high" ? 3 : p === "medium" ? 2 : 1);

    if (mode === "createdAsc") {
      result = [...result].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else if (mode === "createdDesc") {
      result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (mode === "priorityAsc") {
      result = [...result].sort(
        (a, b) => priorityRank(a.priority) - priorityRank(b.priority)
      );
    } else if (mode === "priorityDesc") {
      result = [...result].sort(
        (a, b) => priorityRank(b.priority) - priorityRank(a.priority)
      );
    }

    return result;
  }

  window.TaskFlow.state = state;
  window.TaskFlow.stateApi = { createTask, getFilteredTasks };
})();

