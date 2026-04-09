let tareas = [];
let filtroActivo = "all";

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

/* Funcion para crear una nueva tarea */
function crearTarea(title){
    return{
        id: Date.now(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    };
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

  const nuevaTarea = crearTarea(input.value);

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

/* Funcion para renderizar las tareas */
function renderTareas(){
  lista.innerHTML = "";

  let tareasFiltradas = tareas;

  if(filtroActivo === "completed"){
      tareasFiltradas = tareasFiltradas.filter(t => t.completed);
  }

  if(filtroActivo === "pending"){
      tareasFiltradas = tareasFiltradas.filter(t => !t.completed);
  }

  if(busquedaInput.value){
      const q = busquedaInput.value.toLowerCase();
      tareasFiltradas = tareasFiltradas.filter(t => t.title.toLowerCase().includes(q));
  }



  tareasFiltradas.forEach(tarea =>{

    const clone = template.content.cloneNode(true);

    const texto = clone.querySelector(".desc_texto");
    texto.textContent = tarea.title;

    const checkbox = clone.querySelector(".check");
    checkbox.checked = tarea.completed;

    clone.querySelector(".edit").addEventListener("click", () => {
      
      const input = document.createElement("input");
      input.type = "text";
      input.value = tarea.title;
      input.className = "bg-white/90 text-slate-900 placeholder:text-slate-500 border border-white/20 p-[0.4rem] text-[16px] rounded-[10px] w-full max-w-full";

      texto.replaceWith(input);

      input.focus();

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          tarea.title = input.value;
          renderTareas();
          guardarTareas();
        }
      });

      input.addEventListener("blur", () => {
        tarea.title = input.value;
        renderTareas();
        guardarTareas();
      });
    });

    checkbox.addEventListener("click", () =>{
        tarea.completed = !tarea.completed;
        renderTareas();
        guardarTareas();
    });

   clone.querySelector(".delete").addEventListener("click", () =>{
        tareas = tareas.filter(t => t.id !== tarea.id);
        renderTareas();
        guardarTareas();
    });

    if (tarea.completed){
        clone.querySelector(".desc_texto").classList.add("line-through");
    }

    lista.appendChild(clone);
  });

  // Actualiza stats incluso si no hay tareas renderizadas
  renderStats();
}

function renderStats(){
    
    const total = tareas.length;

    const completed = tareas.filter(t => t.completed).length;

    const pending = total - completed;

    totalEl.textContent = total;
    completedEl.textContent = completed;
    pendingEl.textContent = pending;
}

function guardarTareas(){
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

function cargarTareas(){
    const tareasGuardadas = localStorage.getItem("tareas");

    if(tareasGuardadas){
        tareas = JSON.parse(tareasGuardadas);
    }
}
