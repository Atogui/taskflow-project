// Namespace
window.TaskFlow = window.TaskFlow || {};

/** @typedef {import("../app.js").Task} Task */

(() => {
  const STORAGE_KEY = "tareas";

  /**
   * Normaliza un array de tareas desde cualquier fuente.
   * @param {unknown} value
   * @returns {Task[]}
   */
  function normalizeTasks(value) {
    if (!Array.isArray(value)) return [];

    return value
      .filter((t) => t && typeof t === "object")
      .map((t) => {
        const obj = /** @type {any} */ (t);
        const dueDate =
          typeof obj.dueDate === "string" && obj.dueDate.trim() !== ""
            ? obj.dueDate.trim()
            : null;
        const reminderAt =
          typeof obj.reminderAt === "string" && obj.reminderAt.trim() !== ""
            ? obj.reminderAt.trim()
            : null;
        const priority =
          obj.priority === "high" || obj.priority === "low" || obj.priority === "medium"
            ? obj.priority
            : "medium";
        const tags = Array.isArray(obj.tags)
          ? obj.tags
              .map((x) => String(x).trim())
              .filter((x) => x !== "")
              .map((x) => x.toLowerCase())
              .filter((x, idx, arr) => arr.indexOf(x) === idx)
          : [];
        return {
          id: typeof obj.id === "number" ? obj.id : Date.now(),
          title: typeof obj.title === "string" ? obj.title.trim() : "",
          completed: Boolean(obj.completed),
          createdAt:
            typeof obj.createdAt === "string"
              ? obj.createdAt
              : new Date().toISOString(),
          dueDate,
          reminderAt,
          priority,
          tags,
        };
      })
      .filter((t) => t.title !== "");
  }

  /**
   * Carga tareas desde localStorage.
   * @returns {Task[]}
   */
  function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return normalizeTasks(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  /**
   * Guarda tareas en localStorage.
   * @param {Task[]} tasks
   * @returns {void}
   */
  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  window.TaskFlow.storage = { loadTasks, saveTasks };
})();

