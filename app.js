let tareas = [];
let filtroActivo = "all";

/**
 * @typedef {Object} Task
 * @property {number} id - Identificador único de la tarea.
 * @property {string} title - Título/descrición de la tarea.
 * @property {boolean} completed - Indica si la tarea está completada.
 * @property {string} createdAt - Fecha de creación en formato ISO.
 */

const form = document.getElementById("form_tarea");
const input = document.getElementById("input_tarea");
const lista = document.getElementById("Li_tareas");
const template = document.getElementById("tarea_template");
const totalEl = document.getElementById("total");
const completedEl = document.getElementById("completadas");
const pendingEl = document.getElementById("pendientes");
const botonesFiltro = document.querySelectorAll(".bot_filtro");
const completarTodasBtn = document.getElementById("complete");
const eliminarCompletadasBtn = document.getElementById("wipe");
const busquedaInput = document.getElementById("search");


cargarTareas();
renderTareas();

/**
 * Crea una nueva tarea.
 * @param {string} title - Texto de la tarea.
 * @returns {Task}
 */
function crearTarea(title){
    return{
        id: Date.now(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    };
}

/**
 * Devuelve las tareas filtradas por estado y búsqueda.
 * @param {Task[]} tareasBase
 * @param {"all"|"pending"|"completed"} filtro
 * @param {string} query
 * @returns {Task[]}
 */
function getTareasFiltradas(tareasBase, filtro, query){
    let result = tareasBase;

    if(filtro === "completed"){
        result = result.filter(t => t.completed);
    }

    if(filtro === "pending"){
        result = result.filter(t => !t.completed);
    }

    const q = query.trim().toLowerCase();
    if(q){
        result = result.filter(t => t.title.toLowerCase().includes(q));
    }

    return result;
}

/**
 * Crea el fragmento DOM de una tarea a partir del template.
 * @param {Task} tarea
 * @returns {{
 *  fragment: DocumentFragment,
 *  textoEl: HTMLElement,
 *  checkboxEl: HTMLInputElement,
 *  editBtn: HTMLButtonElement,
 *  deleteBtn: HTMLButtonElement
 * }}
 */
function crearElementoTarea(tarea){
    const fragment = template.content.cloneNode(true);

    /** @type {HTMLElement} */
    const textoEl = fragment.querySelector(".desc_texto");
    textoEl.textContent = tarea.title;

    /** @type {HTMLInputElement} */
    const checkboxEl = fragment.querySelector(".check");
    checkboxEl.checked = tarea.completed;

    /** @type {HTMLButtonElement} */
    const editBtn = fragment.querySelector(".edit");
    /** @type {HTMLButtonElement} */
    const deleteBtn = fragment.querySelector(".delete");

    if(tarea.completed){
        textoEl.classList.add("line-through");
    }

    return { fragment, textoEl, checkboxEl, editBtn, deleteBtn };
}

/**
 * Enlaza eventos de una tarea (editar/completar/eliminar).
 * @param {object} params
 * @param {Task} params.tarea
 * @param {HTMLElement} params.textoEl
 * @param {HTMLInputElement} params.checkboxEl
 * @param {HTMLButtonElement} params.editBtn
 * @param {HTMLButtonElement} params.deleteBtn
 * @returns {void}
 */
function bindTareaEvents({ tarea, textoEl, checkboxEl, editBtn, deleteBtn }){
    checkboxEl.addEventListener("click", () =>{
        tarea.completed = !tarea.completed;
        renderTareas();
        guardarTareas();
    });

    deleteBtn.addEventListener("click", () =>{
        tareas = tareas.filter(t => t.id !== tarea.id);
        renderTareas();
        guardarTareas();
    });

    editBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = tarea.title;
      input.className = "bg-white/90 text-slate-900 placeholder:text-slate-500 border border-white/20 p-[0.4rem] text-[16px] rounded-[10px] w-full max-w-full";

      textoEl.replaceWith(input);
      input.focus();

      const previousTitle = tarea.title;

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const nuevoTexto = input.value.trim();
          tarea.title = nuevoTexto === "" ? previousTitle : nuevoTexto;
          renderTareas();
          guardarTareas();
        }
      });

      input.addEventListener("blur", () => {
        const nuevoTexto = input.value.trim();
        tarea.title = nuevoTexto === "" ? previousTitle : nuevoTexto;
        renderTareas();
        guardarTareas();
      });
    });
}

botonesFiltro.forEach(btn => {
    btn.addEventListener("click", () => {
        botonesFiltro.forEach(b => b.classList.replace("bg-[rgb(34,_173,_46)]","bg-[rgb(51,_51,_51)]"));
        btn.classList.replace("bg-[rgb(51,_51,_51)]","bg-[rgb(34,_173,_46)]");

        filtroActivo = btn.dataset.filter || "all";
        renderTareas();
    });
});

form.addEventListener("submit", function(e){
  e.preventDefault();
  const texto = input.value.trim();
  if (texto === "") return;

  const nuevaTarea = crearTarea(texto);

  tareas.push(nuevaTarea);

  renderTareas();
  guardarTareas();

  input.value = "";
});

completarTodasBtn.addEventListener("click", () => {
    tareas.forEach(t => t.completed = true);
    renderTareas();
    guardarTareas();
});

eliminarCompletadasBtn.addEventListener("click", () => {
    tareas = tareas.filter(t => !t.completed);
    renderTareas();
    guardarTareas();
});

busquedaInput.addEventListener("keyup", () => {
    renderTareas();
});

/**
 * Renderiza la lista de tareas aplicando filtro y búsqueda.
 * Efectos: actualiza el DOM y enlaza listeners de cada tarea.
 * Depende del estado global: `tareas`, `filtroActivo` y `busquedaInput`.
 * @returns {void}
 */
function renderTareas(){
  lista.innerHTML = "";

  const tareasFiltradas = getTareasFiltradas(tareas, filtroActivo, busquedaInput.value);

  tareasFiltradas.forEach(tarea =>{
    const { fragment, textoEl, checkboxEl, editBtn, deleteBtn } = crearElementoTarea(tarea);
    bindTareaEvents({ tarea, textoEl, checkboxEl, editBtn, deleteBtn });
    lista.appendChild(fragment);
  });

  // Actualiza stats incluso si no hay tareas renderizadas
  renderStats();
}

/**
 * Renderiza estadísticas (total/completadas/pendientes).
 * @returns {void}
 */
function renderStats(){
    
    const total = tareas.length;

    const completed = tareas.filter(t => t.completed).length;

    const pending = total - completed;

    totalEl.textContent = total;
    completedEl.textContent = completed;
    pendingEl.textContent = pending;
}

/**
 * Persiste el array `tareas` en localStorage.
 * @returns {void}
 */
function guardarTareas(){
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

/**
 * Carga tareas desde localStorage (si existen) y las asigna a `tareas`.
 * @returns {void}
 */
function cargarTareas(){
    const tareasGuardadas = localStorage.getItem("tareas");

    if(tareasGuardadas){
        try{
            const parsed = JSON.parse(tareasGuardadas);
            if(!Array.isArray(parsed)){
                tareas = [];
                return;
            }

            tareas = parsed
              .filter(t => t && typeof t === "object")
              .map(t => ({
                  id: typeof t.id === "number" ? t.id : Date.now(),
                  title: typeof t.title === "string" ? t.title.trim() : "",
                  completed: Boolean(t.completed),
                  createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString()
              }))
              .filter(t => t.title !== "");
        }catch{
            tareas = [];
        }
    }
}
