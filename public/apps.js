(() => {
  const API_URL = '/api'; // Vercel serverless functions
  
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

  // --- State ---
  let token = localStorage.getItem('token') || null;
  let currentUser = null;
  let modeLogin = true;
  let currentUsername = null;

  // --- API Functions ---
  async function apiCall(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async function login(username, password) {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    token = data.token;
    localStorage.setItem('token', token);
    return data;
  }

  async function register(username, password) {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    token = data.token;
    localStorage.setItem('token', token);
    return data;
  }

  async function fetchUser() {
    return await apiCall('/user');
  }

  async function updateProfile(profile) {
    return await apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }

  async function updateExercises(selectedExercises) {
    return await apiCall('/user/exercises', {
      method: 'PUT',
      body: JSON.stringify({ selectedExercises })
    });
  }

  async function updateMeals(selectedMeals) {
    return await apiCall('/user/meals', {
      method: 'PUT',
      body: JSON.stringify({ selectedMeals })
    });
  }

  async function updateCalorieGoal(calorieGoal) {
    return await apiCall('/user/calorie-goal', {
      method: 'PUT',
      body: JSON.stringify({ calorieGoal })
    });
  }

  async function updateSessions(workoutSessions) {
    return await apiCall('/user/sessions', {
      method: 'PUT',
      body: JSON.stringify({ workoutSessions })
    });
  }

  // --- Auth ---
  function setAuthMode(login) {
    modeLogin = login;
    authSubmit.textContent = login ? 'Login' : 'Sign Up';
    authToggle.textContent = login ? 'Need an account? Sign up' : 'Already have an account? Login';
  }
  
  authToggle.addEventListener('click', () => setAuthMode(!modeLogin));

  authSubmit.addEventListener('click', async () => {
    const u = (authUsername.value || '').trim();
    const p = (authPassword.value || '').trim();
    if (!u || !p){ alert('Please fill in all fields'); return; }

    const endpoint = modeLogin ? '/api/auth/login' : '/api/auth/register';  // Adjust to your actual login endpoint
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });

      if (!response.ok) {
        let errorMsg = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = response.statusText || errorMsg;
        }
        alert(errorMsg);
        return;
      }

      const data = await response.json();
      if (data.token) {  // API returns { token, username } on success
        localStorage.setItem('token', data.token);
        currentUsername = data.username;
        renderApp();
      } else {
        alert('Unexpected response');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });

  logoutBtn.addEventListener('click', () => {
    currentUsername = null;
    localStorage.removeItem('token');
    renderApp();
  });

  // Show/hide password toggle
  if (showPassword && authPassword) {
    showPassword.addEventListener('change', () => {
      authPassword.type = showPassword.checked ? 'text' : 'password';
    });
  }

  // --- Helpers ---
  function resetAuthInputs() {
    if (authPassword) authPassword.type = 'password';
    if (showPassword) showPassword.checked = false;
    if (authUsername) authUsername.value = '';
    if (authPassword) authPassword.value = '';
  }

  function calcBMR(user) {
    const p = user.profile;
    const w = parseFloat(p.weight), h = parseFloat(p.height), a = parseFloat(p.age);
    if (!w || !h || !a || !p.gender) return null;
    const bmr = p.gender === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;
    return Math.round(bmr);
  }

  // --- Render Functions ---
  function renderProfile() {
    if (!currentUser) return;
    inputWeight.value = currentUser.profile.weight || '';
    inputHeight.value = currentUser.profile.height || '';
    inputAge.value = currentUser.profile.age || '';
    inputGender.value = currentUser.profile.gender || '';
    const bmr = calcBMR(currentUser);
    if (bmr) {
      bmrBox.classList.remove('hidden');
      bmrLose.textContent = bmr - 500;
      bmrMaintain.textContent = bmr;
      bmrGain.textContent = bmr + 500;
    } else {
      bmrBox.classList.add('hidden');
    }
  }

  function renderExercises(filter = '') {
    if (!currentUser) return;
    exerciseList.innerHTML = '';
    const q = (filter || '').toLowerCase();
    exerciseDatabase
      .filter(ex => !q || ex.name.toLowerCase().includes(q) || ex.category.toLowerCase().includes(q))
      .forEach(ex => {
        const isSelected = currentUser.selectedExercises.find(s => s.id === ex.id);
        const el = document.createElement('label');
        el.className = 'item';
        el.innerHTML = `<input type="checkbox" ${isSelected ? 'checked' : ''} /> 
          <div class="meta"><div class="title">${ex.name}</div><div class="muted">${ex.category} • ~${ex.calories} cal/min</div></div>`;
        const chk = el.querySelector('input');
        chk.addEventListener('change', () => toggleExercise(ex));
        el.addEventListener('click', (e) => {
          if(e.target.tagName !== 'INPUT') chk.checked = !chk.checked;
        });
        exerciseList.appendChild(el);
      });
    renderSelectedExercises();
    renderSessions();
  }

  function renderSelectedExercises() {
    if (!currentUser) return;
    selectedExercisesEl.innerHTML = '';
    if (!currentUser.selectedExercises.length) {
      selectedExercisesEl.innerHTML = '<div class="muted">Select exercises to build your workout</div>';
      return;
    }
    currentUser.selectedExercises.forEach(ex => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta"><div class="title">${ex.name}</div><div class="muted">${ex.calories} cal/min</div></div>
                       <button class="btn ghost small">Remove</button>`;
      div.querySelector('button').addEventListener('click', () => toggleExercise(ex));
      selectedExercisesEl.appendChild(div);
    });
  }

  function renderSessions() {
    if (!currentUser) return;
    sessionsList.innerHTML = '';
    (currentUser.workoutSessions || []).slice().reverse().forEach(sess => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta"><div class="title">${sess.name}</div><div class="muted">${sess.exercises.length} exercises</div></div>
                       <div style="display:flex;gap:8px"><button class="btn">Load</button><button class="btn ghost">Delete</button></div>`;
      div.querySelector('button').addEventListener('click', () => loadWorkoutSession(sess));
      div.querySelectorAll('button')[1].addEventListener('click', () => deleteWorkoutSession(sess.id));
      sessionsList.appendChild(div);
    });
  }

  function renderMeals(filter = '') {
    if (!currentUser) return;
    mealList.innerHTML = '';
    const q = (filter || '').toLowerCase();
    mealDatabase
      .filter(m => !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
      .forEach(meal => {
        const isSelected = currentUser.selectedMeals.find(s => s.id === meal.id);
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

  function renderSelectedMeals() {
    if (!currentUser) return;
    selectedMealsEl.innerHTML = '';
    const total = (currentUser.selectedMeals || []).reduce((s, m) => s + m.calories, 0);
    totalMealCaloriesEl.textContent = total;
    const goal = currentUser.calorieGoal || 2000;
    calDiffEl.textContent = (total - goal);
    if (!currentUser.selectedMeals.length) {
      selectedMealsEl.innerHTML = '<div class="muted">Select meals to add to your daily plan</div>';
      return;
    }
    currentUser.selectedMeals.forEach(m => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta"><div class="title">${m.name}</div><div class="muted">${m.calories} cal</div></div>
                       <button class="btn ghost">Remove</button>`;
      div.querySelector('button').addEventListener('click', () => toggleMeal(m));
      selectedMealsEl.appendChild(div);
    });
  }

  // --- Actions ---
  async function toggleExercise(exercise) {
    const exists = currentUser.selectedExercises.find(s => s.id === exercise.id);
    if (exists) {
      currentUser.selectedExercises = currentUser.selectedExercises.filter(s => s.id !== exercise.id);
    } else {
      currentUser.selectedExercises.push(exercise);
    }
    try {
      await updateExercises(currentUser.selectedExercises);
      renderExercises(exerciseSearch.value);
    } catch (error) {
      alert('Failed to update exercises');
    }
  }

  async function toggleMeal(meal) {
    const exists = currentUser.selectedMeals.find(s => s.id === meal.id);
    if (exists) {
      currentUser.selectedMeals = currentUser.selectedMeals.filter(s => s.id !== meal.id);
    } else {
      currentUser.selectedMeals.push(meal);
    }
    try {
      await updateMeals(currentUser.selectedMeals);
      renderMeals(mealSearch.value);
    } catch (error) {
      alert('Failed to update meals');
    }
  }

  async function updateProfileField(field, value) {
    currentUser.profile[field] = value;
    try {
      await updateProfile(currentUser.profile);
      renderProfile();
    } catch (error) {
      alert('Failed to update profile');
    }
  }

  async function updateCalorieGoalValue(value) {
    currentUser.calorieGoal = parseInt(value) || 2000;
    try {
      await updateCalorieGoal(currentUser.calorieGoal);
      renderSelectedMeals();
    } catch (error) {
      alert('Failed to update calorie goal');
    }
  }

  async function saveWorkoutSessionAction() {
    const name = (sessionName.value || '').trim();
    if (!name) { alert('Please enter a session name'); return; }
    const newSession = { id: Date.now(), name, exercises: currentUser.selectedExercises.slice() };
    currentUser.workoutSessions = (currentUser.workoutSessions || []).concat(newSession);
    currentUser.selectedExercises = [];
    try {
      await updateSessions(currentUser.workoutSessions);
      await updateExercises(currentUser.selectedExercises);
      sessionName.value = '';
      renderExercises(exerciseSearch.value);
    } catch (error) {
      alert('Failed to save session');
    }
  }

  async function loadWorkoutSession(session) {
    currentUser.selectedExercises = session.exercises.slice();
    try {
      await updateExercises(currentUser.selectedExercises);
      renderExercises(exerciseSearch.value);
    } catch (error) {
      alert('Failed to load session');
    }
  }

  async function deleteWorkoutSession(sessionId) {
    currentUser.workoutSessions = (currentUser.workoutSessions || []).filter(s => s.id !== sessionId);
    try {
      await updateSessions(currentUser.workoutSessions);
      renderSessions();
    } catch (error) {
      alert('Failed to delete session');
    }
  }

  // UI wiring
  exerciseSearch.addEventListener('input', () => renderExercises(exerciseSearch.value));
  mealSearch.addEventListener('input', () => renderMeals(mealSearch.value));
  inputWeight.addEventListener('input', () => updateProfileField('weight', inputWeight.value));
  inputHeight.addEventListener('input', () => updateProfileField('height', inputHeight.value));
  inputAge.addEventListener('input', () => updateProfileField('age', inputAge.value));
  inputGender.addEventListener('change', () => updateProfileField('gender', inputGender.value));
  saveSession.addEventListener('click', saveWorkoutSessionAction);
  clearSelection.addEventListener('click', async () => {
    currentUser.selectedExercises = [];
    await updateExercises(currentUser.selectedExercises);
    renderExercises();
  });
  calorieGoalInput.addEventListener('input', () => updateCalorieGoalValue(calorieGoalInput.value));

  // Tabs
  function setActiveTab(tab) {
    tabProfile.classList.remove('active'); 
    tabExercises.classList.remove('active'); 
    tabMeals.classList.remove('active');
    panelProfile.classList.add('hidden'); 
    panelExercises.classList.add('hidden'); 
    panelMeals.classList.add('hidden');
    if (tab === 'profile') { tabProfile.classList.add('active'); panelProfile.classList.remove('hidden'); }
    if (tab === 'exercises') { tabExercises.classList.add('active'); panelExercises.classList.remove('hidden'); }
    if (tab === 'meals') { tabMeals.classList.add('active'); panelMeals.classList.remove('hidden'); }
  }
  
  tabProfile.addEventListener('click', () => setActiveTab('profile'));
  tabExercises.addEventListener('click', () => setActiveTab('exercises'));
  tabMeals.addEventListener('click', () => setActiveTab('meals'));

  // Main render
  async function renderApp() {
    const token = localStorage.getItem('token');
    if (!token){
      // show auth
      authContainer.classList.remove('hidden');
      appEl.classList.add('hidden');
      setAuthMode(true);
      resetAuthInputs();
      return;
    }

    // Optionally fetch user data with token
    // fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()).then(user => { cachedUser = user; ... })

    authContainer.classList.add('hidden');
    appEl.classList.remove('hidden');
    welcomeText.textContent = `Welcome, ${currentUsername}!`;

    inputWeight.value = currentUser.profile.weight || '';
    inputHeight.value = currentUser.profile.height || '';
    inputAge.value = currentUser.profile.age || '';
    inputGender.value = currentUser.profile.gender || '';
    calorieGoalInput.value = currentUser.calorieGoal || 2000;

    setActiveTab('profile');
    renderProfile();
    renderExercises();
    renderMeals();
  }

  // Bootstrap
  renderApp();
})();