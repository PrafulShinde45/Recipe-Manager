// js/ui.js
import { loadRecipes, saveRecipes, initIfEmpty, resetCorrupt } from './storage.js';

const state = {
  recipes: [],
  filters: { q: '', difficulty: '', maxPrep: null }
};

function byId(id) { return document.getElementById(id) }

function filterRecipes() {
  const { q, difficulty, maxPrep } = state.filters;
  return state.recipes.filter(r => {
    const okQ = r.title.toLowerCase().includes(q.toLowerCase());
    const okD = !difficulty || difficulty === 'All' ? true : r.difficulty === difficulty;
    const okP = maxPrep != null && maxPrep !== '' ? Number(r.prepTime) <= Number(maxPrep) : true;
    return okQ && okD && okP;
  });
}

function renderGrid() {
  const grid = byId('recipesGrid');
  const list = filterRecipes();
  byId('emptyState').hidden = list.length !== 0;
  grid.innerHTML = list.map(r => `
    <article class="card">
      <img src="${r.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80'}" alt="">
      <div class="body">
        <div class="title">${r.title}</div>
        <div class="meta">${r.difficulty} • Prep ${r.prepTime}m • Cook ${r.cookTime}m</div>
        <div class="actions">
          <button class="primary" data-view="detail" data-id="${r.id}">View</button>
          <button data-view="edit" data-id="${r.id}">Edit</button>
          <button data-view="delete" data-id="${r.id}">Delete</button>
        </div>
      </div>
    </article>
  `).join('');
}

function showView(name) {
  byId('homeView').hidden = name !== 'home';
  byId('detailView').hidden = name !== 'detail';
  byId('formView').hidden = name !== 'form';
}

function navigate(hash) {
  location.hash = hash;
}

function renderDetail(id) {
  const r = state.recipes.find(x => x.id === id);
  if (!r) { showView('home'); return }
  const el = byId('detailCard');
  el.innerHTML = `
    <img class="hero" src="${r.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80'}" alt="">
    <div class="content">
      <h2>${r.title}</h2>
      <div class="meta">${r.difficulty} • Prep ${r.prepTime}m • Cook ${r.cookTime}m</div>
      <p>${r.description}</p>
      <div>
        <span class="pill">Ingredients</span>
        <ul class="list">${r.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
      <div>
        <span class="pill">Steps</span>
        <ol class="list">${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>
      <div class="actions">
        <button class="primary" data-view="edit" data-id="${r.id}">Edit</button>
        <button data-view="delete" data-id="${r.id}">Delete</button>
      </div>
    </div>
  `;
  showView('detail');
}

function formValues() {
  return {
    id: byId('recipeId').value || crypto.randomUUID(),
    title: byId('title').value.trim(),
    description: byId('description').value.trim(),
    ingredients: byId('ingredients').value.split('\n').map(s => s.trim()).filter(Boolean),
    steps: byId('steps').value.split('\n').map(s => s.trim()).filter(Boolean),
    prepTime: Number(byId('prepTime').value),
    cookTime: Number(byId('cookTime').value),
    difficulty: byId('difficulty').value,
    imageUrl: byId('imageUrl').value.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function validate(v) {
  const errors = {};
  if (!v.title || v.title.length < 3) errors.title = 'Title must be at least 3 characters';
  if (!v.description || v.description.length < 10) errors.description = 'Description must be at least 10 characters';
  if (!v.ingredients || v.ingredients.length < 2) errors.ingredients = 'Add at least 2 ingredients';
  if (!v.steps || v.steps.length < 2) errors.steps = 'Add at least 2 steps';
  if (!Number.isFinite(v.prepTime) || v.prepTime < 0) errors.prepTime = 'Enter a valid prep time';
  if (!Number.isFinite(v.cookTime) || v.cookTime < 0) errors.cookTime = 'Enter a valid cook time';
  if (!['Easy', 'Medium', 'Hard'].includes(v.difficulty)) errors.difficulty = 'Select difficulty';
  if (v.imageUrl && !/^https?:\/\/.+/i.test(v.imageUrl)) errors.imageUrl = 'Enter a valid URL or leave blank';
  return errors;
}

function showErrors(errors) {
  ['title','description','ingredients','steps','prepTime','cookTime','difficulty','imageUrl'].forEach(k => {
    const el = document.querySelector(`.error[data-error-for="${k}"]`);
    if (el) el.textContent = errors[k] || '';
  });
}

function fillForm(r) {
  byId('recipeId').value = r?.id || '';
  byId('title').value = r?.title || '';
  byId('description').value = r?.description || '';
  byId('ingredients').value = r?.ingredients?.join('\n') || '';
  byId('steps').value = r?.steps?.join('\n') || '';
  byId('prepTime').value = r?.prepTime ?? '';
  byId('cookTime').value = r?.cookTime ?? '';
  byId('difficulty').value = r?.difficulty || '';
  byId('imageUrl').value = r?.imageUrl || '';
}

function showForm(mode, id) {
  const data = id ? state.recipes.find(x => x.id === id) : null;
  fillForm(data || null);
  showView('form');
}

function upsertRecipe(v) {
  const idx = state.recipes.findIndex(x => x.id === v.id);
  if (idx >= 0) {
    v.createdAt = state.recipes[idx].createdAt;
    v.updatedAt = Date.now();
    state.recipes[idx] = v;
  } else {
    state.recipes.unshift(v);
  }
  saveRecipes(state.recipes);
}

function deleteRecipe(id) {
  state.recipes = state.recipes.filter(r => r.id !== id);
  saveRecipes(state.recipes);
}

function wireEvents() {
  byId('addBtn').addEventListener('click', () => { showForm('add'); navigate('#add') });
  byId('searchInput').addEventListener('input', e => { state.filters.q = e.target.value; renderGrid() });
  byId('difficultyFilter').addEventListener('change', e => { state.filters.difficulty = e.target.value; renderGrid() });
  byId('maxPrepInput').addEventListener('input', e => { state.filters.maxPrep = e.target.value; renderGrid() });

  document.body.addEventListener('click', e => {
    const t = e.target;
    if (t.matches('[data-view="detail"]')) { navigate(`#detail/${t.dataset.id}`) }
    if (t.matches('[data-view="edit"]')) { showForm('edit', t.dataset.id); navigate(`#edit/${t.dataset.id}`) }
    if (t.matches('[data-view="delete"]')) {
      deleteRecipe(t.dataset.id);
      renderGrid();
      showView('home');
      navigate('#home');
    }
    if (t.matches('.link[data-action="back"]')) { showView('home'); navigate('#home') }
  });

  byId('cancelBtn').addEventListener('click', () => { showView('home'); navigate('#home') });

  byId('recipeForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = formValues();
    const errs = validate(v);
    showErrors(errs);
    if (Object.keys(errs).length > 0) return;
    upsertRecipe(v);
    renderGrid();
    showView('home');
    navigate('#home');
  });
}

function parseRoute() {
  const h = location.hash || '#home';
  if (h.startsWith('#detail/')) return { view: 'detail', id: h.split('/')[1] };
  if (h.startsWith('#edit/')) return { view: 'edit', id: h.split('/')[1] };
  if (h === '#add') return { view: 'form' };
  return { view: 'home' };
}

function handleHashChange() {
  const r = parseRoute();
  if (r.view === 'detail') renderDetail(r.id);
  else if (r.view === 'edit') showForm('edit', r.id);
  else if (r.view === 'form') showForm('add');
  else { showView('home'); renderGrid() }
}

export function startApp() {
  let corrupted = false;
  try {
    const list = loadRecipes();
    if (!Array.isArray(list)) throw new Error('corrupt');
    state.recipes = list;
  } catch {
    corrupted = true;
    resetCorrupt(msg => {
      byId('statusBanner').textContent = msg;
      byId('statusBanner').hidden = false;
    });
    state.recipes = loadRecipes();
  }
  initIfEmpty(msg => {
    byId('statusBanner').textContent = msg;
    byId('statusBanner').hidden = false;
  });
  state.recipes = loadRecipes();
  wireEvents();
  renderGrid();
  showView('home');

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}