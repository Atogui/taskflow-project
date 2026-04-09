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
   * @param {HTMLElement} refs.totalEl
   * @param {HTMLElement} refs.completedEl
   * @param {HTMLElement} refs.pendingEl
   * @returns {void}
   */
  function initUI(refs) {
    const { state, storage, stateApi } = window.TaskFlow;

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
          renderTasks();
          storage.saveTasks(state.tasks);
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

          const commit = () => {
            const nuevoTexto = input.value.trim();
            tarea.title = nuevoTexto === "" ? previousTitle : nuevoTexto;
            renderTasks();
            storage.saveTasks(state.tasks);
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
        renderTasks();
        storage.saveTasks(state.tasks);
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

      state.tasks.push(stateApi.createTask(texto));
      renderTasks();
      storage.saveTasks(state.tasks);
      refs.inputNueva.value = "";
    });

    // Acciones
    refs.completarTodasBtn.addEventListener("click", () => {
      state.tasks.forEach((t) => (t.completed = true));
      renderTasks();
      storage.saveTasks(state.tasks);
    });

    refs.eliminarCompletadasBtn.addEventListener("click", () => {
      state.tasks = state.tasks.filter((t) => !t.completed);
      renderTasks();
      storage.saveTasks(state.tasks);
    });

    // Búsqueda (mantengo keyup para no cambiar UX)
    refs.busquedaInput.addEventListener("keyup", () => renderTasks());

    initDelegation();
    renderTasks();
  }

  window.TaskFlow.ui = { initUI };
})();

