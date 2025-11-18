const tpl = document.getElementById('exerciseTpl');
const exercisesEl = document.getElementById('exercises');
const addExerciseBtn = document.getElementById('addExercise');
const workoutForm = document.getElementById('workoutForm');
const workoutList = document.getElementById('workoutList');
const emptyHint = document.getElementById('emptyHint');
const exportAllBtn = document.getElementById('exportAll');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearAllBtn = document.getElementById('clearAll');

// new elements for library
const libraryGrid = document.getElementById('libraryGrid');
const addSelectedBtn = document.getElementById('addSelectedBtn');

let editingId = null;

function addExerciseRow(data = {}) {
  const node = tpl.content.cloneNode(true);
  const row = node.querySelector('.exercise-row');
  row.querySelector('.ex-name').value = data.name || '';
  row.querySelector('.ex-sets').value = data.sets || 3;
  row.querySelector('.ex-reps').value = data.reps || '8-12';
  row.querySelector('.ex-rest').value = data.rest || 60;
  const descEl = row.querySelector('.ex-desc');
  if (descEl) descEl.value = data.desc || '';
  row.querySelector('.remove-ex').addEventListener('click', () => row.remove());
  exercisesEl.appendChild(row);
}

// generate library with five premade, non-editable descriptions
function generateLibrary() {
  if (!libraryGrid) return;
  const items = [
    {
      name: 'Chest Fly',
      desc: 'Isolation chest exercise. Use cables or dumbbells; focus on a controlled arc and squeeze at peak contraction. 3 sets × 10–12 reps.'
    },
    {
      name: 'Bench Press',
      desc: 'Compound chest exercise. Use flat bench; keep scapula retracted and drive through the chest. 3–5 sets × 4–8 reps (strength) or 8–12 (hypertrophy).'
    },
    {
      name: 'Lat Pulldown',
      desc: 'Back width developer. Pull to upper chest with shoulder blades down and back; avoid rocking. 3 sets × 8–12 reps.'
    },
    {
      name: 'Seated Row',
      desc: 'Mid-back thickness exercise. Keep torso upright and pull with elbows; squeeze shoulder blades together. 3 sets × 8–12 reps.'
    },
    {
      name: 'T-Bar Row',
      desc: 'Back thickness movement. Hinge at hips and pull to lower chest/upper abdomen; maintain a flat back. 3 sets × 6–10 reps.'
    }
  ];

  libraryGrid.innerHTML = '';
  items.forEach((it) => {
    const card = document.createElement('label');
    card.className = 'lib-card';
    card.tabIndex = 0;
    card.dataset.name = it.name;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'lib-name';
    nameDiv.textContent = it.name;

    const descDiv = document.createElement('div');
    descDiv.className = 'lib-desc';
    descDiv.textContent = it.desc;

    const checkbox = document.createElement('input');
    checkbox.className = 'lib-check';
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `Select ${it.name}`);

    card.appendChild(nameDiv);
    card.appendChild(descDiv);
    card.appendChild(checkbox);

    // toggle selection on click or keyboard
    card.addEventListener('click', (e) => {
      if (e.target === checkbox) {
        card.classList.toggle('selected', checkbox.checked);
        return;
      }
      checkbox.checked = !checkbox.checked;
      card.classList.toggle('selected', checkbox.checked);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        card.classList.toggle('selected', checkbox.checked);
      }
    });

    checkbox.addEventListener('change', () => card.classList.toggle('selected', checkbox.checked));

    libraryGrid.appendChild(card);
  });
}

addSelectedBtn.addEventListener('click', () => {
  const cards = Array.from(libraryGrid.querySelectorAll('.lib-card'));
  const selected = cards.filter(c => c.querySelector('.lib-check').checked);
  if (selected.length === 0) return alert('Select at least one exercise from the library');
  selected.forEach(c => {
    const name = c.dataset.name || c.querySelector('.lib-name').textContent;
    const desc = c.querySelector('.lib-desc').textContent || '';
    addExerciseRow({ name, desc });
    // optionally uncheck after adding
    c.querySelector('.lib-check').checked = false;
    c.classList.remove('selected');
  });
});

workoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('workoutName').value.trim();
  if (!name) return alert('Enter a workout name');
  const rows = Array.from(exercisesEl.querySelectorAll('.exercise-row'));
  const exercises = rows.map(r => ({
    name: r.querySelector('.ex-name').value.trim(),
    sets: Number(r.querySelector('.ex-sets').value) || 1,
    reps: r.querySelector('.ex-reps').value.trim(),
    rest: Number(r.querySelector('.ex-rest').value) || 0,
    desc: (r.querySelector('.ex-desc') && r.querySelector('.ex-desc').value.trim()) || ''
  })).filter(x => x.name);
  if (exercises.length === 0) return alert('Add at least one exercise');
  const all = loadWorkouts();
  if (editingId) {
    const idx = all.findIndex(w => w.id === editingId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], name, exercises, modified: Date.now() };
    }
    editingId = null;
  } else {
    all.unshift({ id: Date.now().toString(36), name, exercises, created: Date.now() });
  }
  saveWorkouts(all);
  clearForm();
});

window.addEventListener('DOMContentLoaded', () => {
  addExerciseRow(); // one default row
  renderWorkouts();
  generateLibrary(); // build the selectable library
});