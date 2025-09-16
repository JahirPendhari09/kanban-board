// Entry point for the Kanban board application
// Initializes the application, loads tasks from storage, and binds event listeners

(function () {
  'use strict';

  const Storage = (function () {
    const KEY = 'kanban.tasks.v1';

    function save(tasks) {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, data: tasks }));
    }

    function load() {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed.data) ? parsed.data : [];
      } catch (e) {
        console.warn('Failed to parse storage', e);
        return [];
      }
    }

    function clear() {
      localStorage.removeItem(KEY);
    }

    return { save, load, clear };
  })();

  const Render = (function () {
    function el(tag, attrs = {}, ...children) {
      const node = document.createElement(tag);
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'dataset') Object.assign(node.dataset, attrs[k]);
        else if (k === 'html') node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
      for (const c of children) {
        if (typeof c === 'string') node.appendChild(document.createTextNode(c));
        else if (c instanceof Node) node.appendChild(c);
      }
      return node;
    }

    function createTaskCard(task) {
      const card = el('article', { class: 'card', draggable: 'true', tabindex: 0 });
      card.dataset.id = task.id;

      const title = el('h3', {}, task.title);
      const desc = el('p', {}, task.description || '');

      card.appendChild(title);
      card.appendChild(desc);

      return card;
    }

    function renderBoard(tasks) {
      const statuses = ['todo', 'inprogress', 'done'];
      statuses.forEach(status => {
        const container = document.querySelector(`[data-list-for="${status}"]`);
        container.innerHTML = ''; // clear
        const filtered = tasks.filter(t => t.status === status);
        filtered.forEach(t => container.appendChild(createTaskCard(t)));
        const countEl = document.querySelector(`[data-count-for="${status}"]`);
        if (countEl) countEl.textContent = filtered.length;
      });
    }

    return { el, createTaskCard, renderBoard };
  })();

  const DragDrop = (function () {
    function makeDraggable(containerSelector, onDropCallback) {
      const board = document.querySelector(containerSelector);
      let dragId = null;

      board.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
        dragId = card.dataset.id;
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', dragId); } catch (er) {}
        card.classList.add('dragging');
      });

      board.addEventListener('dragend', (e) => {
        const card = e.target.closest('.card');
        if (card) card.classList.remove('dragging');
        dragId = null;
      });

      board.querySelectorAll('.column').forEach(col => {
        col.addEventListener('dragover', (e) => {
          e.preventDefault();
          col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', (e) => {
          col.classList.remove('drag-over');
        });
        col.addEventListener('drop', (e) => {
          e.preventDefault();
          col.classList.remove('drag-over');
          const status = col.dataset.status;
          const id = e.dataTransfer?.getData('text/plain') || dragId;
          if (id) onDropCallback(id, status);
        });
      });

      board.addEventListener('keydown', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const order = ['todo', 'inprogress', 'done'];
          const id = card.dataset.id;
          const parent = card.closest('.column');
          const cur = parent.dataset.status;
          let idx = order.indexOf(cur);
          idx = e.key === 'ArrowRight' ? Math.min(order.length - 1, idx + 1) : Math.max(0, idx - 1);
          const newStatus = order[idx];
          onDropCallback(id, newStatus);
        }
      });
    }

    return { makeDraggable };
  })();

  const App = (function (Storage, Render, DragDrop) {
    let tasks = [];

    function uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function loadState() {
      tasks = Storage.load();
    }

    function persist() {
      Storage.save(tasks);
    }

    function addTask(title, description) {
      const t = { id: uid(), title: title.trim(), description: description.trim(), status: 'todo' };
      tasks.unshift(t);
      persist();
      Render.renderBoard(tasks);
    }

    function moveTask(id, newStatus) {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return;
      tasks[idx].status = newStatus;
      persist();
      Render.renderBoard(tasks);
      setTimeout(() => {
        const el = document.querySelector(`.card[data-id="${id}"]`);
        if (el) el.focus();
      }, 20);
    }

    function bindForm() {
      const form = document.getElementById('taskForm');
      const title = document.getElementById('title');
      const desc = document.getElementById('desc');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!title.value.trim()) return title.focus();
        addTask(title.value, desc.value || '');
        form.reset();
        title.focus();
      });
    }

    function bindCardClicks() {
      document.getElementById('board').addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
        card.classList.toggle('expanded');
      });
    }

    function initDragDrop() {
      DragDrop.makeDraggable('#board', (id, status) => moveTask(id, status));
    }

    function start() {
      loadState();
      Render.renderBoard(tasks);
      bindForm();
      bindCardClicks();
      initDragDrop();
    }

    return { start, addTask, moveTask };
  })(Storage, Render, DragDrop);

  document.addEventListener('DOMContentLoaded', () => App.start());

})();