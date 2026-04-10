// Namespace
window.TaskFlow = window.TaskFlow || {};

(() => {
  /** @type {Map<number, number>} */
  const timersByTaskId = new Map();

  function clearAll() {
    timersByTaskId.forEach((timerId) => clearTimeout(timerId));
    timersByTaskId.clear();
  }

  /**
   * @param {string} datetimeLocalStr
   * @returns {number | null}
   */
  function parseDatetimeLocal(datetimeLocalStr) {
    const s = String(datetimeLocalStr || "").trim();
    if (!s) return null;
    const ts = Date.parse(s);
    return Number.isFinite(ts) ? ts : null;
  }

  async function requestPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    try {
      return await Notification.requestPermission();
    } catch {
      return "default";
    }
  }

  /**
   * Programa recordatorios para todas las tareas actuales.
   * @param {Array<{id:number,title:string,completed:boolean,reminderAt?:string|null}>} tasks
   * @returns {void}
   */
  function reschedule(tasks) {
    clearAll();

    if (!Array.isArray(tasks) || tasks.length === 0) return;

    tasks.forEach((t) => {
      if (!t || typeof t !== "object") return;
      if (t.completed) return;

      const reminderAt = typeof t.reminderAt === "string" ? t.reminderAt : "";
      const ts = parseDatetimeLocal(reminderAt);
      if (ts === null) return;

      const delay = ts - Date.now();
      if (delay <= 0) return;

      // Guardrail: si el delay es enorme, sigue siendo válido (setTimeout soporta ~24.8 días).
      // Para MVP, ignoramos la reprogramación a largo plazo; con la app abierta funcionará.
      const safeDelay = Math.min(delay, 2_147_483_647);

      const timerId = window.setTimeout(() => {
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            // eslint-disable-next-line no-new
            new Notification("TaskFlow: recordatorio", { body: t.title });
          } else {
            // Fallback simple si no hay permisos o no hay soporte
            alert(`Recordatorio: ${t.title}`);
          }
        } catch {
          alert(`Recordatorio: ${t.title}`);
        }
      }, safeDelay);

      timersByTaskId.set(t.id, timerId);
    });
  }

  window.TaskFlow.reminders = { requestPermission, reschedule };
})();

