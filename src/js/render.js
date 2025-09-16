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
    // update counts
    const countEl = document.querySelector(`[data-count-for="${status}"]`);
    if (countEl) countEl.textContent = filtered.length;
  });
}

export { el, createTaskCard, renderBoard };