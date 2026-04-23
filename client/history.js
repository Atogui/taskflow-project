// Namespace
window.TaskFlow = window.TaskFlow || {};

(() => {
  const MAX = 50;

  /** @type {any[]} */
  let past = [];
  /** @type {any[]} */
  let future = [];

  /**
   * Clonación profunda para snapshots.
   * - Usa `structuredClone` si está disponible.
   * - Fallback: JSON (suficiente para el estado actual: arrays/objetos simples).
   * @template T
   * @param {T} value
   * @returns {T}
   */
  function clone(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return /** @type {T} */ (JSON.parse(JSON.stringify(value)));
  }

  /**
   * Guarda un snapshot del estado actual (por ejemplo, `state.tasks`).
   * Importante: al hacer `push`, se invalida el stack de redo.
   * @param {any} snapshot
   */
  function push(snapshot) {
    past.push(clone(snapshot));
    if (past.length > MAX) past = past.slice(past.length - MAX);
    future = [];
  }

  /**
   * Reinicia el historial con un snapshot inicial (estado base).
   * @param {any} snapshot
   */
  function reset(snapshot) {
    past = [clone(snapshot)];
    future = [];
  }

  /**
   * Indica si hay un estado anterior disponible.
   * @returns {boolean}
   */
  function canUndo() {
    return past.length > 1;
  }

  /**
   * Indica si hay un estado siguiente disponible (tras un undo).
   * @returns {boolean}
   */
  function canRedo() {
    return future.length > 0;
  }

  /**
   * Deshace al snapshot anterior.
   * - Mueve el snapshot actual al stack `future`.
   * - Devuelve el snapshot anterior (clonado) para aplicarlo al estado.
   * @returns {any | null}
   */
  function undo() {
    if (!canUndo()) return null;
    const current = past.pop();
    future.push(current);
    return clone(past[past.length - 1]);
  }

  /**
   * Rehace al snapshot siguiente.
   * - Mueve el snapshot desde `future` a `past`.
   * - Devuelve ese snapshot (clonado) para aplicarlo al estado.
   * @returns {any | null}
   */
  function redo() {
    if (!canRedo()) return null;
    const next = future.pop();
    past.push(next);
    return clone(next);
  }

  window.TaskFlow.history = { push, reset, undo, redo, canUndo, canRedo };
})();

