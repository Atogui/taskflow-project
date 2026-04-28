const taskService = require("../services/task.service");

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .map((x) => String(x).trim().toLowerCase())
    .filter((x) => x !== "");
  return normalized.filter((x, idx, arr) => arr.indexOf(x) === idx);
}

function normalizeOptionalDate(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function isValidDueDate(value) {
  if (value === null) return true;
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidReminderAt(value) {
  if (value === null) return true;
  if (typeof value !== "string") return false;
  const ts = Date.parse(value);
  return Number.isFinite(ts);
}

function normalizePriority(value) {
  if (value === undefined) return undefined;
  return value === "high" || value === "low" || value === "medium" ? value : null;
}

// GET /api/v1/tasks
function obtenerTodas(req, res, next) {
  const tasks = taskService.obtenerTodas();
  return res.status(200).json(tasks);
}
// POST /api/v1/tasks
function crearTarea(req, res, next) { 
  const { title, dueDate, reminderAt, priority, tags } = req.body;
  // Validación defensiva
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return res.status(400).json({
      error: "El title es obligatorio y debe tener al menos 3 caracteres.",
    });
  }

  const due = normalizeOptionalDate(dueDate);
  if (!isValidDueDate(due)) {
    return res.status(400).json({ error: "dueDate debe ser YYYY-MM-DD o null." });
  }

  const reminder = normalizeOptionalDate(reminderAt);
  if (!isValidReminderAt(reminder)) {
    return res.status(400).json({ error: "reminderAt debe ser una fecha válida o null." });
  }

  const p = normalizePriority(priority);
  if (p === null) {
    return res.status(400).json({ error: 'priority debe ser "low", "medium" o "high".' });
  }

  const nueva = taskService.crearTarea({
    title: title.trim(),
    dueDate: due,
    reminderAt: reminder,
    priority: p ?? undefined,
    tags: normalizeTags(tags),
  });
  return res.status(201).json(nueva);
}
// DELETE /api/v1/tasks/:id
function eliminarTarea(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "El id debe ser un número válido." });
  }
  try {
    taskService.eliminarTarea(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
// PUT /api/v1/tasks/:id
function reemplazarTarea (req, res, next) {
  const id = Number(req.params.id);
  const { title, completed, dueDate, reminderAt, priority, tags } = req.body;
  // Validación defensiva del id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "El id debe ser un número válido." });
  }
  // Validación defensiva del title
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return res.status(400).json({
      error: "El title es obligatorio y debe tener al menos 3 caracteres.",
    });
  }

  // En PUT aceptamos el recurso completo; si faltan campos opcionales los reemplazamos por defaults.
  const due = normalizeOptionalDate(dueDate);
  if (!isValidDueDate(due)) {
    return res.status(400).json({ error: "dueDate debe ser YYYY-MM-DD o null." });
  }

  const reminder = normalizeOptionalDate(reminderAt);
  if (!isValidReminderAt(reminder)) {
    return res.status(400).json({ error: "reminderAt debe ser una fecha válida o null." });
  }

  const p = normalizePriority(priority);
  if (p === null) {
    return res.status(400).json({ error: 'priority debe ser "low", "medium" o "high".' });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed debe ser boolean." });
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    return res.status(400).json({ error: "tags debe ser un array de strings." });
  }

  try {
    const tarea = taskService.actualizarTarea(id, {
      title: title.trim(),
      completed: completed ?? false,
      dueDate: due,
      reminderAt: reminder,
      priority: p ?? "medium",
      tags: normalizeTags(tags),
    });
    return res.status(200).json(tarea);
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/v1/tasks/:id
function actualizarTarea(req, res, next) {
  const id = Number(req.params.id);
  const { title, completed, dueDate, reminderAt, priority, tags } = req.body;
  // Validación defensiva del id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "El id debe ser un número válido." });
  }

  const patch = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "Si envías title, debe tener al menos 3 caracteres." });
    }
    patch.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "completed debe ser boolean." });
    }
    patch.completed = completed;
  }

  if (dueDate !== undefined) {
    const due = normalizeOptionalDate(dueDate);
    if (!isValidDueDate(due)) {
      return res.status(400).json({ error: "dueDate debe ser YYYY-MM-DD o null." });
    }
    patch.dueDate = due;
  }

  if (reminderAt !== undefined) {
    const reminder = normalizeOptionalDate(reminderAt);
    if (!isValidReminderAt(reminder)) {
      return res.status(400).json({ error: "reminderAt debe ser una fecha válida o null." });
    }
    patch.reminderAt = reminder;
  }

  if (priority !== undefined) {
    const p = normalizePriority(priority);
    if (p === null) {
      return res.status(400).json({ error: 'priority debe ser "low", "medium" o "high".' });
    }
    patch.priority = p;
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: "tags debe ser un array de strings." });
    }
    patch.tags = normalizeTags(tags);
  }

  try {
    const tarea = taskService.actualizarTarea(id, patch);
    return res.status(200).json(tarea);
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/v1/tasks/:id/complete
function completarTarea(req, res, next) {
  const id = Number(req.params.id);
  // Validación defensiva del id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "El id debe ser un número válido." });
  }
  try {
    const tarea = taskService.completarTarea(id);
    return res.status(200).json(tarea);
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/v1/tasks/:id/uncomplete
function descompletarTarea(req, res, next) {
  const id = Number(req.params.id);
  // Validación defensiva del id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "El id debe ser un número válido." });
  }
  try {
    const tarea = taskService.descompletarTarea(id);
    return res.status(200).json(tarea);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
  actualizarTarea,
  completarTarea,
  descompletarTarea,
  reemplazarTarea,
};