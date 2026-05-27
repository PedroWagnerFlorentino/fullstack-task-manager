/* =============================================
   TASKLY — app.js
   Responsabilidades:
   - Gerenciar tarefas (criar, marcar, apagar)
   - Renderizar cards no board (drag livre)
   - Renderizar lista com filtros
   - Controlar sidebar e modal
   ============================================= */

// ──────────────────────────────────────────────
// ESTADO
// ──────────────────────────────────────────────
let tasks = [];       // { id, title, content, date, done, x, y }
let currentView = 'board';
let activeFilter = 'all';
let activeDateFilter = 'all';

// ──────────────────────────────────────────────
// ELEMENTOS
// ──────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const mainWrap = document.getElementById('main-wrap');
const sidebarToggle = document.getElementById('sidebar-toggle');
const viewBoard = document.getElementById('view-board');
const viewList = document.getElementById('view-list');
const boardCanvas = document.getElementById('board-canvas');
const boardEmpty = document.getElementById('board-empty');
const listBody = document.getElementById('list-body');
const viewTitle = document.getElementById('view-title');
const countTotal = document.getElementById('count-total');
const countDone = document.getElementById('count-done');
const btnNew = document.getElementById('btn-new');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const taskTitleInput = document.getElementById('task-title');
const taskContent = document.getElementById('task-content');
const taskDate = document.getElementById('task-date');
const searchInput = document.getElementById('search-input');
const dateFilter = document.getElementById('date-filter');
const filterBtns = document.querySelectorAll('.filter-btn');
const navItems = document.querySelectorAll('.nav-item');


// ──────────────────────────────────────────────
// Proteção contra acesso sem login 
// ──────────────────────────────────────────────
if (!localStorage.getItem('usuario_id')) {
  window.location.href = 'login.html';
}

// ──────────────────────────────────────────────
// SIDEBAR
// ──────────────────────────────────────────────
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('closed');
  mainWrap.classList.toggle('expanded');
});

// ──────────────────────────────────────────────
// NAVEGAÇÃO
// ──────────────────────────────────────────────
navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    currentView = view;
    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (view === 'board') {
      viewBoard.classList.remove('hidden');
      viewList.classList.add('hidden');
      viewTitle.textContent = 'Board';
    } else {
      viewBoard.classList.add('hidden');
      viewList.classList.remove('hidden');
      viewTitle.textContent = 'Lista';
      renderList();
    }
  });
});

// ──────────────────────────────────────────────
// MODAL
// ──────────────────────────────────────────────
function openModal() {
  taskTitleInput.value = '';
  taskContent.value = '';
  taskDate.value = '';
  modalOverlay.classList.remove('hidden');
  taskTitleInput.focus();
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

btnNew.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

modalSave.addEventListener('click', async () => {
  const title = taskTitleInput.value.trim();
  if (!title) { taskTitleInput.focus(); return; }

  // Posição inicial: centro da canvas com leve aleatoriedade
  const canvas = boardCanvas.getBoundingClientRect();
  const x = Math.max(20, Math.random() * (canvas.width - 260) + 20);
  const y = Math.max(20, Math.random() * (canvas.height - 200) + 20);

  // mandando dados para a API
  const usuario_id = localStorage.getItem("usuario_id")
  const payload = {
    titulo: title,
    descricao: taskContent.value.trim(),
    prazo: taskDate.value || null,
    concluida: false,
    pos_x: x,
    pos_y: y,
    usuario_id: Number(usuario_id),
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Erro ao salvar tarefa");

    const task = await response.json();

    tasks.push(task);
    closeModal();
    renderBoard();
    updateCount();
    if (currentView === 'list') renderList();

  } catch (err) {
    console.error(err);
    alert('Não foi possível salvar a tarefa. Tente novamente.');
  }

});

// Enter no título salva
taskTitleInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') modalSave.click();
});

// ──────────────────────────────────────────────
// BOARD — renderização e drag
// ──────────────────────────────────────────────
function renderBoard() {
  // Remove cards existentes (mantém o empty)
  boardCanvas.querySelectorAll('.task-card').forEach(c => c.remove());
  boardEmpty.style.display = tasks.length ? 'none' : 'flex';

  tasks.forEach(task => {
    const card = createCard(task);
    boardCanvas.appendChild(card);
  });
}

function createCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card' + (task.concluida ? ' done' : '');
  card.dataset.id = task.id;
  card.style.left = task.pos_x + 'px';
  card.style.top = task.pos_y + 'px';

  const dateLabel = formatDate(task.prazo);
  const dateClass = getDateClass(task.prazo);

  card.innerHTML = `
    <div class="card-title">${escHtml(task.titulo)}</div>
    ${task.descricao ? `<div class="card-content">${escHtml(task.descricao)}</div>` : ''}
    ${task.prazo ? `<div class="card-date ${dateClass}">📅 ${dateLabel}</div>` : ''}
    <div class="card-actions">
      <button class="card-btn done-btn ${task.concluida ? 'active' : ''}" title="Marcar como feita">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ${task.concluida ? 'Feita' : 'Feita?'}
      </button>
      <button class="card-btn delete-btn" title="Apagar tarefa">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
        </svg>
      </button>
    </div>
  `;

  // Botão feita
  card.querySelector('.done-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleDone(task.id);
  });

  // Botão apagar
  card.querySelector('.delete-btn').addEventListener('click', e => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  // Drag
  makeDraggable(card, task);

  return card;
}

function makeDraggable(card, task) {
  let dragging = false;
  let startX, startY, origX, origY;

  card.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return; // não arrastar se clicar em botão
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origX = task.pos_x;
    origY = task.pos_y;
    card.classList.add('dragging');
    card.style.zIndex = 998;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    task.pos_x = origX + dx;
    task.pos_y = origY + dy;
    card.style.left = task.pos_x + 'px';
    card.style.top = task.pos_y + 'px';
  });

  document.addEventListener('mouseup', async () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    card.style.zIndex = '';

    // manda as posições para o banco de dados
    try {
      await fetch(`http://127.0.0.1:8000/tarefas/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pos_x: task.pos_x,
          pos_y: task.pos_y
        }),
      });
    } catch (err) {
      console.error('Erro ao salvar posição:', err);
    }
  });
}


// ──────────────────────────────────────────────
// LISTA — renderização e filtros
// ──────────────────────────────────────────────
function renderList() {
  const search = searchInput.value.toLowerCase();
  const today = todayStr();

  const filtered = tasks.filter(task => {
    // Filtro texto
    if (search && !task.titulo.toLowerCase().includes(search)) return false;

    // Filtro status
    if (activeFilter === 'pending' && task.concluida) return false;
    if (activeFilter === 'done' && !task.concluida) return false;

    // Filtro data
    if (activeDateFilter !== 'all') {
      if (!task.prazo) return false;
      if (activeDateFilter === 'today' && task.prazo !== today) return false;
      if (activeDateFilter === 'week' && !isThisWeek(task.prazo)) return false;
      if (activeDateFilter === 'overdue' && (task.prazo >= today || task.concluida)) return false;
    }

    return true;
  });

  listBody.innerHTML = '';

  if (!filtered.length) {
    listBody.innerHTML = '<div class="list-empty">Nenhuma tarefa encontrada.</div>';
    return;
  }

  filtered.forEach(task => {
    const row = document.createElement('div');
    row.className = 'list-row';

    const dateLabel = formatDate(task.prazo);
    const dateClass = getDateClass(task.prazo);

    row.innerHTML = `
      <div class="row-check ${task.concluida ? 'checked' : ''}" data-id="${task.id}"></div>
      <div class="row-info">
        <div class="row-title ${task.concluida ? 'done' : ''}">${escHtml(task.titulo)}</div>
        ${task.descricao ? `<div class="row-content">${escHtml(task.descricao)}</div>` : ''}
      </div>
      ${task.prazo ? `<div class="row-date ${dateClass}">${dateLabel}</div>` : ''}
      <button class="row-delete" data-id="${task.id}" title="Apagar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    row.querySelector('.row-check').addEventListener('click', () => toggleDone(task.id));
    row.querySelector('.row-delete').addEventListener('click', () => deleteTask(task.id));

    listBody.appendChild(row);
  });
}

// Filtros de status
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderList();
  });
});

// Filtro de data
dateFilter.addEventListener('change', () => {
  activeDateFilter = dateFilter.value;
  renderList();
});

// Busca
searchInput.addEventListener('input', renderList);

// ──────────────────────────────────────────────
// AÇÕES DE TAREFA
// ──────────────────────────────────────────────
async function toggleDone(id) {
  const task = tasks.find(t => t.id === id);

  if (!task) return;
  try {
    const response = await fetch(`http://127.0.0.1:8000/tarefas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concluida: !task.concluida }),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar tarefa");
    }

    task.concluida = !task.concluida;
    renderBoard();
    updateCount();
    if (currentView === 'list') renderList();
  } catch (err) {
    console.error(err);
    alert("Não foi possivel atualizar a tarefa");
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/tarefas/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error("Erro ao deletar tarefa");

    tasks = tasks.filter(t => t.id !== id);
    renderBoard();
    updateCount();
    if (currentView === 'list') renderList();
  } catch (err) {
    console.error(err);
    alert("Não foi possivel deletar a tarefa");
  }
}

function updateCount() {
  countTotal.textContent = tasks.length;
  countDone.textContent = tasks.filter(t => t.concluida).length;
}

// ──────────────────────────────────────────────
// UTILITÁRIOS
// ──────────────────────────────────────────────
function escHtml(str = '') {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function isThisWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return d >= startOfWeek && d <= endOfWeek;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parte = dateStr.split('T')[0];
  const [y, m, d] = parte.split('-');
  return `${d}/${m}/${y}`;
}

function getDateClass(dateStr) {
  if (!dateStr) return '';
  const today = todayStr();
  if (dateStr < today) return 'overdue';
  if (dateStr === today) return 'today';
  return '';
}

// Função para carregar todas as tarefas do usuário ao entrar
async function carregarTarefas() {

  const usuario_id = localStorage.getItem("usuario_id")

  if (!usuario_id) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/tarefas/buscar/${usuario_id}`);

    if (!response.ok) {
      throw new Error("Erro ao buscar tarefas");
    }

    tasks = await response.json();

    renderBoard();
    renderList();
    updateCount();
  } catch (err) {
    console.error(err);
  }
}
//sempre usa a função ao abrir o site
carregarTarefas();

// funciona pois no HTML já chama a função com o click
function logout() {
  localStorage.removeItem('usuario_id');
  window.location.href = 'login.html';
}