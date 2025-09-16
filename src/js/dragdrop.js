(function () {
  'use strict';

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

  window.DragDropModule = { makeDraggable };
})();