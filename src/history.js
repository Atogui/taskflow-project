// Namespace
window.TaskFlow = window.TaskFlow || {};

(() => {
  const MAX = 50;

  /** @type {any[]} */
  let past = [];
  /** @type {any[]} */
  let future = [];

  /**
   * @template T
   * @param {T} value
   * @returns {T}
   */
  function clone(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return /** @type {T} */ (JSON.parse(JSON.stringify(value)));
  }

  /**
   * Guarda un snapshot "antes del cambio".
   * @param {any} snapshot
   */
  function push(snapshot) {
    past.push(clone(snapshot));
    if (past.length > MAX) past = past.slice(past.length - MAX);
    future = [];
  }

  /**
   * @param {any} snapshot
   */
  function reset(snapshot) {
    past = [clone(snapshot)];
    future = [];
  }

  function canUndo() {
    return past.length > 1;
  }

  function canRedo() {
    return future.length > 0;
  }

  /**
   * Devuelve el snapshot anterior.
   * @returns {any | null}
   */
  function undo() {
    if (!canUndo()) return null;
    const current = past.pop();
    future.push(current);
    return clone(past[past.length - 1]);
  }

  /**
   * Devuelve el snapshot siguiente.
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

