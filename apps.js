// Simple client-side app ported from React file. Persists to localStorage.
(() => {
  // --- DB ---
  const exerciseDatabase = [
    { id: 1, name: 'Push-ups', category: 'Chest', calories: 7 },
    { id: 2, name: 'Pull-ups', category: 'Back', calories: 10 },
    { id: 3, name: 'Squats', category: 'Legs', calories: 8 },
    { id: 4, name: 'Lunges', category: 'Legs', calories: 6 },
    { id: 5, name: 'Plank', category: 'Core', calories: 5 },
    { id: 6, name: 'Burpees', category: 'Full Body', calories: 12 },
    { id: 7, name: 'Bench Press', category: 'Chest', calories: 8 },
    { id: 8, name: 'Deadlifts', category: 'Back', calories: 10 },
    { id: 9, name: 'Bicep Curls', category: 'Arms', calories: 4 },
    { id: 10, name: 'Tricep Dips', category: 'Arms', calories: 5 },
    { id: 11, name: 'Jumping Jacks', category: 'Cardio', calories: 8 },
    { id: 12, name: 'Running', category: 'Cardio', calories: 11 },
  ];

  const mealDatabase = [
    { id: 1, name: 'Grilled Chicken Breast', calories: 165, category: 'Protein' },
    { id: 2, name: 'Brown Rice (1 cup)', calories: 215, category: 'Carbs' },
    { id: 3, name: 'Broccoli (1 cup)', calories: 55, category: 'Vegetables' },
    { id: 4, name: 'Salmon Fillet', calories: 280, category: 'Protein' },
    { id: 5, name: 'Avocado', calories: 240, category: 'Fats' },
    { id: 6, name: 'Greek Yogurt', calories: 130, category: 'Protein' },
    { id: 7, name: 'Banana', calories: 105, category: 'Fruits' },
    { id: 8, name: 'Oatmeal (1 cup)', calories: 150, category: 'Carbs' },
    { id: 9, name: 'Eggs (2 large)', calories: 140, category: 'Protein' },
    { id: 10, name: 'Sweet Potato', calories: 180, category: 'Carbs' },
    { id: 11, name: 'Spinach Salad', calories: 85, category: 'Vegetables' },
    { id: 12, name: 'Almonds (handful)', calories: 160, category: 'Fats' },
  ];

  // --- DOM ---
  const authContainer = document.getElementById('authContainer');
  const appEl = document.getElementById('app');
  const authUsername = document.getElementById('authUsername');
  const authPassword = document.getElementById('authPassword');
  const showPassword = document.getElementById('showPassword');
  const authSubmit = document.getElementById('authSubmit');
  const authToggle = document.getElementById('authToggle');

  const welcomeText = document.getElementById('welcomeText');
  const logoutBtn = document.getElementById('logoutBtn');

  const tabProfile = document.getElementById('tabProfile');
  const tabExercises = document.getElementById('tabExercises');
  const tabMeals = document.getElementById('tabMeals');

  const panelProfile = document.getElementById('panelProfile');
  const panelExercises = document.getElementById('panelExercises');
  const panelMeals = document.getElementById('panelMeals');

  // Profile
  const inputWeight = document.getElementById('inputWeight');
  const inputHeight = document.getElementById('inputHeight');
  const inputAge = document.getElementById('inputAge');
  const inputGender = document.getElementById('inputGender');
  const bmrBox = document.getElementById('bmrBox');
  const bmrLose = document.getElementById('bmrLose');
  const bmrMaintain = document.getElementById('bmrMaintain');
  const bmrGain = document.getElementById('bmrGain');

  // Exercises
  const exerciseSearch = document.getElementById('exerciseSearch');
  const exerciseList = document.getElementById('exerciseList');
  const selectedExercisesEl = document.getElementById('selectedExercises');
  const sessionName = document.getElementById('sessionName');
  const saveSession = document.getElementById('saveSession');
  const clearSelection = document.getElementById('clearSelection');
  const sessionsList = document.getElementById('sessionsList');

  // Meals
  const mealSearch = document.getElementById('mealSearch');
  const mealList = document.getElementById('mealList');
  const selectedMealsEl = document.getElementById('selectedMeals');
  const calorieGoalInput = document.getElementById('calorieGoal');
  const totalMealCaloriesEl = document.getElementById('totalMealCalories');
  const calDiffEl = document.getElementById('calDiff');

  // --- State (persisted) ---
  function loadUsers(){ return JSON.parse(localStorage.getItem('fb_users') || '{}'); }
  function saveUsers(u){ localStorage.setItem('fb_users', JSON.stringify(u)); }
  function loadCurrent(){ return localStorage.getItem('fb_current') || null; }
  function setCurrent(username){ localStorage.setItem('fb_current', username); }
  let users = loadUsers();
  let currentUsername = loadCurrent();
  let modeLogin = true; // auth mode

  // --- Auth ---
  function setAuthMode(login){
    modeLogin = login;
    authSubmit.textContent = login ? 'Login' : 'Sign Up';
    authToggle.textContent = login ? 'Need an account? Sign up' : 'Already have an account? Login';
  }
  authToggle.addEventListener('click', () => setAuthMode(!modeLogin));

  authSubmit.addEventListener('click', () => {
    const u = (authUsername.value || '').trim();
    const p = (authPassword.value || '').trim();
    if (!u || !p){ alert('Please fill in all fields'); return; }
    users = loadUsers();
    if (modeLogin){
      if (users[u] && users[u].password === p){
        currentUsername = u; setCurrent(u); renderApp();
      } else {
        alert('Invalid credentials');
      }
    } else {
      if (users[u]){ alert('Username already exists'); return; }
      const newUser = {
        password: p,
        profile: { weight:'', height:'', age:'', gender:'' },
        selectedExercises: [],
        calorieGoal: 2000,
        selectedMeals: [],
        workoutSessions: []
      };
      users[u] = newUser;
      saveUsers(users);
      currentUsername = u; setCurrent(u); renderApp();
    }
  });

  logoutBtn.addEventListener('click', () => {
    currentUsername = null; setCurrent('');
    renderApp();
  });

  // Show/hide password toggle
  if (showPassword && authPassword) {
    showPassword.addEventListener('change', () => {
      authPassword.type = showPassword.checked ? 'text' : 'password';
    });
  }

  // --- Helpers ---
  function getCurrentUser(){ users = loadUsers(); if (!currentUsername) return null; return users[currentUsername]; }
  function persistCurrentUser(updated){ users = loadUsers(); users[currentUsername] = updated; saveUsers(users); }

  // reset auth inputs and ensure password hidden
  function resetAuthInputs() {
    if (authPassword) authPassword.type = 'password';
    if (showPassword) showPassword.checked = false;
    if (authUsername) authUsername.value = '';
    if (authPassword) authPassword.value = '';
   }

  function calcBMR(user){
    const p = user.profile;
    const w = parseFloat(p.weight), h = parseFloat(p.height), a = parseFloat(p.age);
    if (!w || !h || !a || !p.gender) return null;
    const bmr = p.gender === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;
    return Math.round(bmr);
  }

  // render UI parts
  function renderProfile(){
    const u = getCurrentUser();
    if (!u) return;
    inputWeight.value = u.profile.weight || '';
    inputHeight.value = u.profile.height || '';
    inputAge.value = u.profile.age || '';
    inputGender.value = u.profile.gender || '';
    const bmr = calcBMR(u);
    if (bmr){
      bmrBox.classList.remove('hidden');
      bmrLose.textContent = bmr - 500;
      bmrMaintain.textContent = bmr;
      bmrGain.textContent = bmr + 500;
    } else {
      bmrBox.classList.add('hidden');
    }
  }

  function renderExercises(filter = '') {
    const u = getCurrentUser();
    exerciseList.innerHTML = '';
    const q = (filter || '').toLowerCase();
    exerciseDatabase
      .filter(ex => !q || ex.name.toLowerCase().includes(q) || ex.category.toLowerCase().includes(q))
      .forEach(ex => {
        const isSelected = u.selectedExercises.find(s => s.id === ex.id);
        const el = document.createElement('label');
        el.className = 'item';
        el.innerHTML = `<input type="checkbox" ${isSelected ? 'checked' : ''} /> 
          <div class="meta"><div class="title">${ex.name}</div><div class="muted">${ex.category} • ~${ex.calories} cal/min</div></div>`;
        const chk = el.querySelector('input');
        chk.addEventListener('change', () => {
          toggleExercise(ex);
        });
        el.addEventListener('click', (e) => {
          if(e.target.tagName !== 'INPUT') chk.checked = !chk.checked;
        });
        exerciseList.appendChild(el);
      });
    renderSelectedExercises();
    renderSessions();
  }

  function renderSelectedExercises(){
    const u = getCurrentUser();
    selectedExercisesEl.innerHTML = '';
    if (!u.selectedExercises.length){
      selectedExercisesEl.innerHTML = '<div class="muted">Select exercises to build your workout</div>';
      return;
    }
    u.selectedExercises.forEach(ex => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta"><div class="title">${ex.name}</div><div class="muted">${ex.calories} cal/min</div></div>
                       <button class="btn ghost small">Remove</button>`;
      div.querySelector('button').addEventListener('click', () => toggleExercise(ex));
      selectedExercisesEl.appendChild(div);
    });
  }

  function renderSessions(){
    const u = getCurrentUser();
    sessionsList.innerHTML = '';
    (u.workoutSessions || []).slice().reverse().forEach(sess => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta"><div class="title">${sess.name}</div><div class="muted">${sess.exercises.length} exercises</div></div>
                       <div style="display:flex;gap:8px"><button class="btn">Load</button><button class="btn ghost">Delete</button></div>`;
      div.querySelector('button').addEventListener('click', () => {
        loadWorkoutSession(sess);
      });
      div.querySelectorAll('button')[1].addEventListener('click', () => {
        deleteWorkoutSession(sess.id);
      });
      sessionsList.appendChild(div);
    });
  }

  function renderMeals(filter = ''){
    const u = getCurrentUser();
    mealList.innerHTML = '';
    const q = (filter || '').toLowerCase();
    mealDatabase
      .filter(m => !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
      .forEach(meal => {
        const isSelected = u.selectedMeals.find(s => s.id === meal.id);
        const el = document.createElement('label');
        el.className = 'item';
        el.innerHTML = `<input type="checkbox" ${isSelected ? 'checked' : ''} /> 
          <div class="meta"><div class="title">${meal.name}</div><div class="muted">${meal.category} • ${meal.calories} cal</div></div>`;
        const chk = el.querySelector('input');
        chk.addEventListener('change', () => toggleMeal(meal));
        el.addEventListener('click', (e) => {
          if(e.target.tagName !== 'INPUT') chk.checked = !chk.checked;
        });
        mealList.appendChild(el);
      });
    renderSelectedMeals();
  }

  function renderSelectedMeals(){
    const u = getCurrentUser();
    selectedMealsEl.innerHTML = '';
    const total = (u.selectedMeals || []).reduce((s,m)=>s+m.calories,0);
    totalMealCaloriesEl.textContent = total;
    const goal = u.calorieGoal || 2000;
    calDiffEl.textContent = (total - goal);
    if (!u.selectedMeals.length){
      selectedMealsEl.innerHTML = '<div class="muted">Select meals to add to your daily plan</div>';
      return;
    }
    u.selectedMeals.forEach(m => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta"><div class="title">${m.name}</div><div class="muted">${m.calories} cal</div></div>
                       <button class="btn ghost">Remove</button>`;
      div.querySelector('button').addEventListener('click', () => toggleMeal(m));
      selectedMealsEl.appendChild(div);
    });
  }

  // --- Actions ---
  function toggleExercise(exercise){
    const u = getCurrentUser();
    const exists = u.selectedExercises.find(s => s.id === exercise.id);
    if (exists) u.selectedExercises = u.selectedExercises.filter(s => s.id !== exercise.id);
    else u.selectedExercises.push(exercise);
    persistCurrentUser(u);
    renderExercises(exerciseSearch.value);
  }

  function toggleMeal(meal){
    const u = getCurrentUser();
    const exists = u.selectedMeals.find(s => s.id === meal.id);
    if (exists) u.selectedMeals = u.selectedMeals.filter(s => s.id !== meal.id);
    else u.selectedMeals.push(meal);
    persistCurrentUser(u);
    renderMeals(mealSearch.value);
  }

  function updateProfile(field, value){
    const u = getCurrentUser();
    u.profile[field] = value;
    persistCurrentUser(u);
    renderProfile();
  }

  function updateCalorieGoal(value){
    const u = getCurrentUser();
    u.calorieGoal = parseInt(value) || 2000;
    persistCurrentUser(u);
    renderSelectedMeals();
  }

  function saveWorkoutSessionAction(){
    const name = (sessionName.value || '').trim();
    if (!name){ alert('Please enter a session name'); return; }
    const u = getCurrentUser();
    const newSession = { id: Date.now(), name, exercises: u.selectedExercises.slice() };
    u.workoutSessions = (u.workoutSessions || []).concat(newSession);
    u.selectedExercises = [];
    persistCurrentUser(u);
    sessionName.value = '';
    renderExercises(exerciseSearch.value);
  }

  function loadWorkoutSession(session){
    const u = getCurrentUser();
    u.selectedExercises = session.exercises.slice();
    persistCurrentUser(u);
    renderExercises(exerciseSearch.value);
  }

  function deleteWorkoutSession(sessionId){
    const u = getCurrentUser();
    u.workoutSessions = (u.workoutSessions || []).filter(s => s.id !== sessionId);
    persistCurrentUser(u);
    renderSessions();
  }

  // UI wiring
  exerciseSearch.addEventListener('input', () => renderExercises(exerciseSearch.value));
  mealSearch.addEventListener('input', () => renderMeals(mealSearch.value));
  inputWeight.addEventListener('input', () => updateProfile('weight', inputWeight.value));
  inputHeight.addEventListener('input', () => updateProfile('height', inputHeight.value));
  inputAge.addEventListener('input', () => updateProfile('age', inputAge.value));
  inputGender.addEventListener('change', () => updateProfile('gender', inputGender.value));
  saveSession.addEventListener('click', saveWorkoutSessionAction);
  clearSelection.addEventListener('click', () => {
    const u = getCurrentUser(); u.selectedExercises = []; persistCurrentUser(u); renderExercises();
  });
  calorieGoalInput.addEventListener('input', () => updateCalorieGoal(calorieGoalInput.value));

  // Tabs
  function setActiveTab(tab){
    tabProfile.classList.remove('active'); tabExercises.classList.remove('active'); tabMeals.classList.remove('active');
    panelProfile.classList.add('hidden'); panelExercises.classList.add('hidden'); panelMeals.classList.add('hidden');
    if (tab === 'profile'){ tabProfile.classList.add('active'); panelProfile.classList.remove('hidden'); }
    if (tab === 'exercises'){ tabExercises.classList.add('active'); panelExercises.classList.remove('hidden'); }
    if (tab === 'meals'){ tabMeals.classList.add('active'); panelMeals.classList.remove('hidden'); }
  }
  tabProfile.addEventListener('click', ()=> setActiveTab('profile'));
  tabExercises.addEventListener('click', ()=> setActiveTab('exercises'));
  tabMeals.addEventListener('click', ()=> setActiveTab('meals'));

  // Main render
  function renderApp(){
    users = loadUsers();
    if (!currentUsername || !users[currentUsername]){
      // show auth
      authContainer.classList.remove('hidden');
      appEl.classList.add('hidden');
      setAuthMode(true);
      resetAuthInputs();
      return;
    }
    authContainer.classList.add('hidden');
    appEl.classList.remove('hidden');
    welcomeText.textContent = `Welcome, ${currentUsername}!`;
    const user = getCurrentUser();
    // init defaults
    if (!user.calorieGoal) user.calorieGoal = 2000;
    if (!user.selectedExercises) user.selectedExercises = [];
    if (!user.selectedMeals) user.selectedMeals = [];
    if (!user.workoutSessions) user.workoutSessions = [];
    persistCurrentUser(user);

    inputWeight.value = user.profile.weight || '';
    inputHeight.value = user.profile.height || '';
    inputAge.value = user.profile.age || '';
    inputGender.value = user.profile.gender || '';
    calorieGoalInput.value = user.calorieGoal || 2000;

    setActiveTab('profile');
    renderProfile();
    renderExercises();
    renderMeals();
  }

  // bootstrap
  renderApp();

})();