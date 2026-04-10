// Namespace
window.TaskFlow = window.TaskFlow || {};

(() => {
  const { storage, state } = window.TaskFlow;

  /** @type {HTMLFormElement} */
  const form = document.getElementById("form_tarea");
  /** @type {HTMLInputElement} */
  const inputNueva = document.getElementById("input_tarea");
  /** @type {HTMLUListElement} */
  const lista = document.getElementById("Li_tareas");
  /** @type {HTMLTemplateElement} */
  const template = document.getElementById("tarea_template");
  /** @type {HTMLElement} */
  const totalEl = document.getElementById("total");
  /** @type {HTMLElement} */
  const completedEl = document.getElementById("completadas");
  /** @type {HTMLElement} */
  const pendingEl = document.getElementById("pendientes");
  const botonesFiltro = /** @type {NodeListOf<HTMLButtonElement>} */ (
    document.querySelectorAll(".bot_filtro")
  );
  /** @type {HTMLButtonElement} */
  const completarTodasBtn = document.getElementById("complete");
  /** @type {HTMLButtonElement} */
  const eliminarCompletadasBtn = document.getElementById("wipe");
  /** @type {HTMLInputElement} */
  const busquedaInput = document.getElementById("search");
  /** @type {HTMLInputElement} */
  const dueDateInput = document.getElementById("due_date");
  /** @type {HTMLInputElement} */
  const reminderAtInput = document.getElementById("reminder_at");
  /** @type {HTMLButtonElement} */
  const enableRemindersBtn = document.getElementById("enable_reminders");

  // Carga inicial
  state.tasks = storage.loadTasks();

  window.TaskFlow.ui.initUI({
    form,
    inputNueva,
    lista,
    template,
    botonesFiltro,
    completarTodasBtn,
    eliminarCompletadasBtn,
    busquedaInput,
    dueDateInput,
    reminderAtInput,
    enableRemindersBtn,
    totalEl,
    completedEl,
    pendingEl,
  });
})();

