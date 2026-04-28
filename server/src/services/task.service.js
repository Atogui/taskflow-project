let tasks = [];

function obtenerTodas() {
  return tasks;
}

function normalizeOptionalDate(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function normalizePriority(value) {
  return value === "high" || value === "low" || value === "medium" ? value : "medium";
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .map((x) => String(x).trim().toLowerCase())
    .filter((x) => x !== "");
  return normalized.filter((x, idx, arr) => arr.indexOf(x) === idx);
}

function crearTarea(data) {
  const task = {
    id: Date.now(),
    title: data.title,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: normalizeOptionalDate(data.dueDate),
    reminderAt: normalizeOptionalDate(data.reminderAt),
    priority: normalizePriority(data.priority),
    tags: normalizeTags(data.tags),
  };
  tasks.push(task);
  return task;
}

function eliminarTarea(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    throw new Error("NOT_FOUND");
  }
  tasks.splice(idx, 1);
}

function actualizarTarea(id, data) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    throw new Error("NOT_FOUND");
  }
  const current = tasks[idx];
  const next = { ...current };

  if (Object.prototype.hasOwnProperty.call(data, "title")) next.title = data.title;
  if (Object.prototype.hasOwnProperty.call(data, "completed"))
    next.completed = Boolean(data.completed);
  if (Object.prototype.hasOwnProperty.call(data, "dueDate"))
    next.dueDate = normalizeOptionalDate(data.dueDate);
  if (Object.prototype.hasOwnProperty.call(data, "reminderAt"))
    next.reminderAt = normalizeOptionalDate(data.reminderAt);
  if (Object.prototype.hasOwnProperty.call(data, "priority"))
    next.priority = normalizePriority(data.priority);
  if (Object.prototype.hasOwnProperty.call(data, "tags")) next.tags = normalizeTags(data.tags);

  tasks[idx] = next;
  return tasks[idx];
}

function completarTarea(id) {
  return actualizarTarea(id, { completed: true });
}

function descompletarTarea(id) {
  return actualizarTarea(id, { completed: false });
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
  actualizarTarea,
  completarTarea,
  descompletarTarea,
};