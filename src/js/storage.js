const StorageModule = (function () {
  const KEY = 'kanban.tasks.v1';

  function save(tasks) {
    localStorage.setItem(KEY, JSON.stringify({v:1, data: tasks}));
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.data) ? parsed.data : [];
    } catch (e) {
      console.warn('StorageModule: failed to parse storage', e);
      return [];
    }
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  return { save, load, clear };
})();