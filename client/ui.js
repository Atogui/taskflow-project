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
   * @param {HTMLSelectElement} refs.prioritySelect
   * @param {HTMLInputElement} refs.tagsInput
   * @param {HTMLSelectElement} refs.tagFilterSelect
   * @param {HTMLSelectElement} refs.sortModeSelect
   * @param {HTMLButtonElement} refs.undoBtn
   * @param {HTMLButtonElement} refs.redoBtn
   * @param {HTMLButtonElement} refs.enableRemindersBtn
   * @param {HTMLElement} refs.totalEl
   * @param {HTMLElement} refs.completedEl
   * @param {HTMLElement} refs.pendingEl
   * @returns {void}
   */
  function initUI(refs) {
    const { state, storage, stateApi, reminders, history } = window.TaskFlow;

    function syncHistoryButtons() {
      if (!refs.undoBtn || !refs.redoBtn || !history) return;
      refs.undoBtn.disabled = !history.canUndo();
      refs.redoBtn.disabled = !history.canRedo();
    }

    /**
     * Aplica un cambio a `state.tasks`, registra snapshot y persiste.
     * @param {() => void} mutate
     */
    function commitTasksChange(mutate) {
      mutate();
      if (history) history.push(state.tasks);
      persistRenderReschedule();
    }

    function persistRenderReschedule() {
      syncTagFilterOptions();
      renderTasks();
      storage.saveTasks(state.tasks);
      if (reminders && typeof reminders.reschedule === "function") {
        reminders.reschedule(state.tasks);
      }
      syncHistoryButtons();
    }

    /**
     * @returns {string[]}
     */
    function getAllTags() {
      const tags = new Set();
      state.tasks.forEach((t) => {
        if (!t || !Array.isArray(t.tags)) return;
        t.tags.forEach((x) => {
          const s = String(x).trim().toLowerCase();
          if (s) tags.add(s);
        });
      });
      return Array.from(tags).sort((a, b) => a.localeCompare(b));
    }

    function syncTagFilterOptions() {
      if (!refs.tagFilterSelect) return;
      const prev = refs.tagFilterSelect.value || "all";
      const tags = getAllTags();
      refs.tagFilterSelect.innerHTML = "";

      const optAll = document.createElement("option");
      optAll.value = "all";
      optAll.textContent = "Todas";
      refs.tagFilterSelect.appendChild(optAll);

      tags.forEach((tag) => {
        const opt = document.createElement("option");
        opt.value = tag;
        opt.textContent = tag;
        refs.tagFilterSelect.appendChild(opt);
      });

      // Mantener selección si existe
      const stillExists = prev === "all" || tags.includes(prev);
      refs.tagFilterSelect.value = stillExists ? prev : "all";
      state.activeTag = refs.tagFilterSelect.value;
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

      const priorityEl = /** @type {HTMLElement | null} */ (
        fragment.querySelector(".priority_badge")
      );
      if (priorityEl) {
        const p = tarea.priority || "medium";
        priorityEl.textContent =
          p === "high" ? "Alta" : p === "low" ? "Baja" : "Media";
        priorityEl.classList.remove("text-red-200", "text-amber-200", "text-emerald-200");
        if (p === "high") priorityEl.classList.add("text-red-200");
        if (p === "medium") priorityEl.classList.add("text-amber-200");
        if (p === "low") priorityEl.classList.add("text-emerald-200");
      }

      const tagsWrap = /** @type {HTMLElement | null} */ (
        fragment.querySelector(".tags")
      );
      if (tagsWrap) {
        tagsWrap.innerHTML = "";
        const tags = Array.isArray(tarea.tags) ? tarea.tags : [];
        tags.forEach((tag) => {
          const chip = document.createElement("span");
          chip.className =
            "text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-200/90";
          chip.textContent = `#${tag}`;
          tagsWrap.appendChild(chip);
        });
      }

      return fragment;
    }

    function renderTasks() {
      refs.lista.innerHTML = "";

      const tareasFiltradas = stateApi.getFilteredTasks(
        state.tasks,
        state.activeFilter,
        refs.busquedaInput.value,
        state.activeTag,
        state.sortMode
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
          commitTasksChange(() => {
            state.tasks = state.tasks.filter((t) => t.id !== tarea.id);
          });
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
            commitTasksChange(() => {
              tarea.title = nuevoTexto === "" ? previousTitle : nuevoTexto;
            });
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

        commitTasksChange(() => {
          tarea.completed = target.checked;
        });
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
      if (refs.prioritySelect && typeof refs.prioritySelect.value === "string") {
        const p = refs.prioritySelect.value;
        nueva.priority = p === "high" || p === "low" || p === "medium" ? p : "medium";
      }
      if (refs.tagsInput && typeof refs.tagsInput.value === "string") {
        const raw = refs.tagsInput.value;
        const tags = raw
          .split(",")
          .map((x) => x.trim().toLowerCase())
          .filter((x) => x !== "");
        nueva.tags = tags.filter((x, idx, arr) => arr.indexOf(x) === idx);
      }

      commitTasksChange(() => {
        state.tasks.push(nueva);
      });
      refs.inputNueva.value = "";
      if (refs.dueDateInput) refs.dueDateInput.value = "";
      if (refs.reminderAtInput) refs.reminderAtInput.value = "";
      if (refs.prioritySelect) refs.prioritySelect.value = "medium";
      if (refs.tagsInput) refs.tagsInput.value = "";
    });

    // Acciones
    refs.completarTodasBtn.addEventListener("click", () => {
      commitTasksChange(() => {
        state.tasks.forEach((t) => (t.completed = true));
      });
    });

    refs.eliminarCompletadasBtn.addEventListener("click", () => {
      commitTasksChange(() => {
        state.tasks = state.tasks.filter((t) => !t.completed);
      });
    });

    // Búsqueda (mantengo keyup para no cambiar UX)
    refs.busquedaInput.addEventListener("keyup", () => renderTasks());

    // Tag filter + sort
    if (refs.tagFilterSelect) {
      refs.tagFilterSelect.addEventListener("change", () => {
        state.activeTag = refs.tagFilterSelect.value || "all";
        renderTasks();
      });
    }
    if (refs.sortModeSelect) {
      refs.sortModeSelect.addEventListener("change", () => {
        state.sortMode = refs.sortModeSelect.value || "createdDesc";
        renderTasks();
      });
    }

    // Undo / Redo
    if (refs.undoBtn && history) {
      refs.undoBtn.addEventListener("click", () => {
        const snapshot = history.undo();
        if (!snapshot) return;
        state.tasks = snapshot;
        persistRenderReschedule();
      });
    }
    if (refs.redoBtn && history) {
      refs.redoBtn.addEventListener("click", () => {
        const snapshot = history.redo();
        if (!snapshot) return;
        state.tasks = snapshot;
        persistRenderReschedule();
      });
    }

    // Recordatorios
    if (refs.enableRemindersBtn) {
      refs.enableRemindersBtn.addEventListener("click", async () => {
        if (!reminders || typeof reminders.requestPermission !== "function") return;
        await reminders.requestPermission();
        if (typeof reminders.reschedule === "function") reminders.reschedule(state.tasks);
      });
    }

    initDelegation();
    if (history && typeof history.reset === "function") history.reset(state.tasks);
    syncTagFilterOptions();
    renderTasks();
    syncHistoryButtons();
    if (reminders && typeof reminders.reschedule === "function") {
      reminders.reschedule(state.tasks);
    }
  }

  window.TaskFlow.ui = { initUI };
})();

