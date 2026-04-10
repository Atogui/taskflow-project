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
 */

(() => {
  /** @type {{ tasks: Task[], activeFilter: "all"|"pending"|"completed" }} */
  const state = {
    tasks: [],
    activeFilter: "all",
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
    };
  }

  /**
   * Devuelve las tareas filtradas por estado y búsqueda.
   * @param {Task[]} tasks
   * @param {"all"|"pending"|"completed"} filter
   * @param {string} query
   * @returns {Task[]}
   */
  function getFilteredTasks(tasks, filter, query) {
    let result = tasks;

    if (filter === "completed") result = result.filter((t) => t.completed);
    if (filter === "pending") result = result.filter((t) => !t.completed);

    const q = query.trim().toLowerCase();
    if (q) result = result.filter((t) => t.title.toLowerCase().includes(q));

    return result;
  }

  window.TaskFlow.state = state;
  window.TaskFlow.stateApi = { createTask, getFilteredTasks };
})();

