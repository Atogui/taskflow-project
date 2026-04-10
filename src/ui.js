// Namespace
window.TaskFlow = window.TaskFlow || {};

(() => {
  /**
   * @typedef {window.TaskFlow.state.tasks[number]} Task
   */

  /**
   * Inicializa la UI y eventos.
   * @param {object} refs
   * @param {HTMLFormElement} refs.form
   * @param {HTMLInputElement} refs.inputNueva
   * @param {HTMLUListElement} refs.lista
   * @param {HTMLTemplateElement} refs.template
   * @param {NodeListOf<HTMLButtonElement>} refs.botonesFiltro
   * @param {HTMLButtonElement} refs.completarTodasBtn
   * @param {HTMLButtonElement} refs.eliminarCompletadasBtn
   * @param {HTMLInputElement} refs.busquedaInput
   * @param {HTMLInputElement} refs.dueDateInput
   * @param {HTMLInputElement} refs.reminderAtInput
   * @param {HTMLButtonElement} refs.enableRemindersBtn
   * @param {HTMLElement} refs.totalEl
   * @param {HTMLElement} refs.completedEl
   * @param {HTMLElement} refs.pendingEl
   * @returns {void}
   */
  function initUI(refs) {
    const { state, storage, stateApi, reminders } = window.TaskFlow;

    function persistRenderReschedule() {
      renderTasks();
      storage.saveTasks(state.tasks);
      if (reminders && typeof reminders.reschedule === "function") {
        reminders.reschedule(state.tasks);
      }
    }

    /**
     * @param {string | null | undefined} dueDate
     * @returns {{ label: string, severity: "none"|"upcoming"|"overdue" }}
     */
    function getDueLabel(dueDate) {
      const d = typeof dueDate === "string" ? dueDate.trim() : "";
      if (!d) return { label: "", severity: "none" };

      const dueTs = Date.parse(`${d}T23:59:59`);
      if (!Number.isFinite(dueTs)) return { label: "", severity: "none" };

      const now = Date.now();
      const diffMs = dueTs - now;
      const oneDay = 24 * 60 * 60 * 1000;
      const daysLeft = Math.ceil(diffMs / oneDay);

      if (diffMs < 0) return { label: `Vencida: ${d}`, severity: "overdue" };
      if (daysLeft <= 2) return { label: `Próxima: ${d}`, severity: "upcoming" };
      return { label: `Fecha límite: ${d}`, severity: "none" };
    }

    function renderStats() {
      const total = state.tasks.length;
      const completed = state.tasks.filter((t) => t.completed).length;
      const pending = total - completed;

      refs.totalEl.textContent = String(total);
      refs.completedEl.textContent = String(completed);
      refs.pendingEl.textContent = String(pending);
    }

    function crearElementoTarea(tarea) {
      const fragment = refs.template.content.cloneNode(true);

      const li = /** @type {HTMLLIElement} */ (fragment.querySelector("li"));
      li.dataset.id = String(tarea.id);

      const textoEl = /** @type {HTMLElement} */ (
        fragment.querySelector(".desc_texto")
      );
      textoEl.textContent = tarea.title;

      const checkboxEl = /** @type {HTMLInputElement} */ (
        fragment.querySelector(".check")
      );
      checkboxEl.checked = tarea.completed;

      if (tarea.completed) textoEl.classList.add("line-through");

      const dueEl = /** @type {HTMLElement | null} */ (
        fragment.querySelector(".due_text")
      );
      if (dueEl) {
        const { label, severity } = getDueLabel(tarea.dueDate);
        dueEl.textContent = label;
        dueEl.classList.remove("text-red-300", "text-amber-300");
        if (severity === "overdue" && !tarea.completed) {
          dueEl.classList.add("text-red-300");
        } else if (severity === "upcoming" && !tarea.completed) {
          dueEl.classList.add("text-amber-300");
        }
      }

      return fragment;
    }

    function renderTasks() {
      refs.lista.innerHTML = "";

      const tareasFiltradas = stateApi.getFilteredTasks(
        state.tasks,
        state.activeFilter,
        refs.busquedaInput.value
      );

      tareasFiltradas.forEach((t) => {
        refs.lista.appendChild(crearElementoTarea(t));
      });

      renderStats();
    }

    function getTaskById(id) {
      return state.tasks.find((t) => t.id === id);
    }

    function initDelegation() {
      refs.lista.addEventListener("click", (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const li = target.closest("li");
        if (!li || !refs.lista.contains(li)) return;

        const id = Number(li.dataset.id);
        if (!Number.isFinite(id)) return;
        const tarea = getTaskById(id);
        if (!tarea) return;

        if (target.closest("button.delete")) {
          state.tasks = state.tasks.filter((t) => t.id !== tarea.id);
          persistRenderReschedule();
          return;
        }

        if (target.closest("button.edit")) {
          const textoEl = li.querySelector(".desc_texto");
          if (!textoEl) return;

          const input = document.createElement("input");
          input.type = "text";
          input.value = tarea.title;
          input.className =
            "bg-white/90 text-slate-900 placeholder:text-slate-500 border border-white/20 p-[0.4rem] text-[16px] rounded-[10px] w-full max-w-full";

          textoEl.replaceWith(input);
          input.focus();

          const previousTitle = tarea.title;
          let committed = false;

          const commit = () => {
            if (committed) return;
            committed = true;
            const nuevoTexto = input.value.trim();
            tarea.title = nuevoTexto === "" ? previousTitle : nuevoTexto;
            persistRenderReschedule();
          };

          input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") commit();
          });
          input.addEventListener("blur", commit);
        }
      });

      refs.lista.addEventListener("change", (e) => {
        const target = e.target;
        if (!(target instanceof HTMLInputElement)) return;
        if (!target.classList.contains("check")) return;

        const li = target.closest("li");
        if (!li || !refs.lista.contains(li)) return;

        const id = Number(li.dataset.id);
        if (!Number.isFinite(id)) return;
        const tarea = getTaskById(id);
        if (!tarea) return;

        tarea.completed = target.checked;
        persistRenderReschedule();
      });
    }

    // Filtros
    refs.botonesFiltro.forEach((btn) => {
      btn.addEventListener("click", () => {
        refs.botonesFiltro.forEach((b) =>
          b.classList.replace(
            "bg-[rgb(34,_173,_46)]",
            "bg-[rgb(51,_51,_51)]"
          )
        );
        btn.classList.replace(
          "bg-[rgb(51,_51,_51)]",
          "bg-[rgb(34,_173,_46)]"
        );

        state.activeFilter = btn.dataset.filter || "all";
        renderTasks();
      });
    });

    // Crear tarea
    refs.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = refs.inputNueva.value.trim();
      if (texto === "") return;

      const nueva = stateApi.createTask(texto);
      const dueDate =
        refs.dueDateInput && typeof refs.dueDateInput.value === "string"
          ? refs.dueDateInput.value.trim()
          : "";
      const reminderAt =
        refs.reminderAtInput && typeof refs.reminderAtInput.value === "string"
          ? refs.reminderAtInput.value.trim()
          : "";

      nueva.dueDate = dueDate !== "" ? dueDate : null;
      nueva.reminderAt = reminderAt !== "" ? reminderAt : null;

      state.tasks.push(nueva);
      persistRenderReschedule();
      refs.inputNueva.value = "";
      if (refs.dueDateInput) refs.dueDateInput.value = "";
      if (refs.reminderAtInput) refs.reminderAtInput.value = "";
    });

    // Acciones
    refs.completarTodasBtn.addEventListener("click", () => {
      state.tasks.forEach((t) => (t.completed = true));
      persistRenderReschedule();
    });

    refs.eliminarCompletadasBtn.addEventListener("click", () => {
      state.tasks = state.tasks.filter((t) => !t.completed);
      persistRenderReschedule();
    });

    // Búsqueda (mantengo keyup para no cambiar UX)
    refs.busquedaInput.addEventListener("keyup", () => renderTasks());

    // Recordatorios
    if (refs.enableRemindersBtn) {
      refs.enableRemindersBtn.addEventListener("click", async () => {
        if (!reminders || typeof reminders.requestPermission !== "function") return;
        await reminders.requestPermission();
        if (typeof reminders.reschedule === "function") reminders.reschedule(state.tasks);
      });
    }

    initDelegation();
    renderTasks();
    if (reminders && typeof reminders.reschedule === "function") {
      reminders.reschedule(state.tasks);
    }
  }

  window.TaskFlow.ui = { initUI };
})();

