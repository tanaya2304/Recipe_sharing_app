// ==========================================
// 🔧 API CONFIGURATION FOR LOCALHOST
// ==========================================
const API_BASE_URL = 'http://localhost:5000';

// ==========================================
// 🚀 PREMIUM DATA LOADER & DISPLAY MODULE
// ==========================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (typeof SAMPLE_DATA !== 'undefined') {
    console.log('✅ Sample data loaded:', SAMPLE_DATA.recipes.length, 'recipes,', SAMPLE_DATA.chefs.length, 'chefs');
    initializePremiumContent();
  } else {
    console.warn('⚠️  Sample data not loaded yet');
  }
});

function initializePremiumContent() {
  loadHomePageContent();
  loadExplorePageContent();
  updateCuisineRecipeCounts();
  updateDifficultyRecipeCounts();
}

// ==========================================
// 🏠 HOME PAGE CONTENT LOADER
// ==========================================
function loadHomePageContent() {
  const { recipes } = SAMPLE_DATA;
  
  // Recipe of the Day - highest rated recipe
  const rotd = recipes.reduce((best, r) => r.avgRating > best.avgRating ? r : best);
  displayRecipeOfDay(rotd);
  
  // Trending - recipes marked as trending
  const trending = recipes.filter(r => r.trending).slice(0, 15);
  displayTrendingRecipes(trending);
  
  // Staff Picks
  const staffPicks = recipes.filter(r => r.staffPick).slice(0, 10);
  displayStaffPicks(staffPicks);
  
  // Quick Wins (under 15 minutes)
  const quickWins = recipes.filter(r => r.cookTime <= 15).slice(0, 12);
  displayQuickWins(quickWins);
  
  // Vegetarian (show 12 initially)
  const vegetarian = recipes.filter(r => r.category === 'Vegetarian').slice(0, 12);
  displayCategoryRecipes(vegetarian, 'vegRecipes');
  
  // Non-Veg (show 12 initially)
  const nonVeg = recipes.filter(r => r.category === 'Non-Veg').slice(0, 12);
  displayCategoryRecipes(nonVeg, 'nonVegRecipes');
  
  // Quick Recipes category (show 12 initially)
  const quick = recipes.filter(r => r.category === 'Quick Recipes').slice(0, 12);
  displayCategoryRecipes(quick, 'quickRecipes');
  
  // Vegan (show 12 initially)
  const vegan = recipes.filter(r => r.category === 'Vegan').slice(0, 12);
  displayCategoryRecipes(vegan, 'veganRecipes');
  
  // Seasonal
  const seasonal = recipes.filter(r => r.seasonal).slice(0, 10);
  displaySeasonalRecipes(seasonal);
  
  // Update hero stats
  updateHeroStats();
}

function displayRecipeOfDay(recipe) {
  const container = document.getElementById('recipeOfDay');
  if (!container) return;
  
  container.innerHTML = `
    <div class="rotd-card" onclick="viewRecipeDetails(${recipe.id})">
      <div class="rotd-image">
        <div class="rotd-emoji">${recipe.image}</div>
        <div class="rotd-badges">
          <span class="rotd-badge">⭐ ${recipe.avgRating.toFixed(1)}</span>
          <span class="rotd-badge">❤️ ${recipe.likes}</span>
          <span class="rotd-badge">👁️ ${recipe.views}</span>
        </div>
      </div>
      <div class="rotd-content">
        <h3>${recipe.name}</h3>
        <p class="rotd-chef">by ${recipe.chef}</p>
        <p class="rotd-desc">${recipe.ingredients.split(',').slice(0, 5).join(', ')}...</p>
        <div class="rotd-meta">
          <span>⏱️ ${recipe.cookTime} min</span>
          <span>🔥 ${recipe.calories} cal</span>
          <span>📊 ${recipe.difficulty}</span>
          <span>🍽️ ${recipe.servings} servings</span>
        </div>
      </div>
    </div>
  `;
}

function displayTrendingRecipes(recipes) {
  const container = document.getElementById('trendingSection');
  if (!container) return;
  
  container.innerHTML = recipes.map(r => `
    <div class="trending-card" onclick="viewRecipeDetails(${r.id})">
      <div class="trending-rank">🔥</div>
      <div class="recipe-image-emoji">${r.image}</div>
      <h4>${r.name}</h4>
      <p class="recipe-chef">by ${r.chef}</p>
      <div class="recipe-stats-mini">
        <span>⭐ ${r.avgRating.toFixed(1)}</span>
        <span>❤️ ${r.likes}</span>
        <span>👁️ ${r.views}</span>
      </div>
    </div>
  `).join('');
}

function displayStaffPicks(recipes) {
  const container = document.getElementById('staffPicks');
  if (!container) return;
  
  container.innerHTML = recipes.map(r => `
    <div class="staff-pick-card" onclick="viewRecipeDetails(${r.id})">
      <div class="staff-ribbon">⭐ STAFF PICK</div>
      <div class="recipe-image-large">${r.image}</div>
      <div class="recipe-content">
        <h3>${r.name}</h3>
        <p class="recipe-chef">👨‍🍳 ${r.chef}</p>
        <div class="recipe-meta-row">
          <span>⏱️ ${r.cookTime}min</span>
          <span>📊 ${r.difficulty}</span>
        </div>
        <div class="recipe-stats">
          <span>⭐ ${r.avgRating.toFixed(1)}</span>
          <span>❤️ ${r.likes}</span>
          <span>💬 ${r.comments}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function displayQuickWins(recipes) {
  const container = document.getElementById('quickWins');
  if (!container) return;
  
  container.innerHTML = recipes.map(r => `
    <div class="quick-win-card" onclick="viewRecipeDetails(${r.id})">
      <div class="quick-badge">⚡ ${r.cookTime}min</div>
      <div class="recipe-image-emoji">${r.image}</div>
      <h4>${r.name}</h4>
      <p class="recipe-chef">by ${r.chef}</p>
      <div class="recipe-stats-mini">
        <span>⭐ ${r.avgRating.toFixed(1)}</span>
        <span>❤️ ${r.likes}</span>
      </div>
    </div>
  `).join('');
}

function displayCategoryRecipes(recipes, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = recipes.map(r => createRecipeCard(r)).join('');
}

function displaySeasonalRecipes(recipes) {
  const container = document.getElementById('seasonalRecipes');
  if (!container) return;
  
  container.innerHTML = recipes.map(r => `
    <div class="seasonal-card" onclick="viewRecipeDetails(${r.id})">
      <div class="seasonal-badge">🍂 SEASONAL</div>
      <div class="recipe-image-emoji">${r.image}</div>
      <h4>${r.name}</h4>
      <p class="recipe-chef">by ${r.chef}</p>
      <div class="recipe-stats-mini">
        <span>⭐ ${r.avgRating.toFixed(1)}</span>
        <span>❤️ ${r.likes}</span>
      </div>
    </div>
  `).join('');
}

function createRecipeCard(recipe) {
  return `
    <div class="recipe-card" onclick="viewRecipeDetails(${recipe.id})">
      <div class="recipe-image">${recipe.image}</div>
      <div class="recipe-info">
        <h3>${recipe.name}</h3>
        <p class="recipe-meta">
          <span>👨‍🍳 ${recipe.chef}</span>
          <span>⏱️ ${recipe.cookTime} min</span>
        </p>
        <div class="recipe-tags">${recipe.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>
        <div class="recipe-stats">
          <span>⭐ ${recipe.avgRating.toFixed(1)}</span>
          <span>❤️ ${recipe.likes}</span>
          <span>💬 ${recipe.comments}</span>
        </div>
      </div>
    </div>
  `;
}

function updateHeroStats() {
  const { totalRecipes, totalChefs, totalLikes, totalViews, weeklyNewRecipes, weeklyNewChefs, weeklyLikes } = SAMPLE_DATA;
  
  // Hero stats
  document.getElementById('heroRecipes').textContent = totalRecipes + '+';
  document.getElementById('heroChefs').textContent = totalChefs + '+';
  document.getElementById('heroLikes').textContent = (totalLikes / 1000).toFixed(1) + 'K+';
  document.getElementById('heroViews').textContent = (totalViews / 1000000).toFixed(1) + 'M+';
  
  // Community banner
  document.getElementById('weeklyRecipes').textContent = weeklyNewRecipes;
  document.getElementById('weeklyChefs').textContent = weeklyNewChefs;
  document.getElementById('weeklyLikes').textContent = (weeklyLikes / 1000).toFixed(1) + 'K';
}

// ==========================================
// 🌍 EXPLORE PAGE CONTENT LOADER
// ==========================================
function loadExplorePageContent() {
  const { recipes, chefs } = SAMPLE_DATA;
  
  // Trending recipes in explore
  const trending = recipes.filter(r => r.trending).sort((a, b) => b.likes - a.likes).slice(0, 20);
  displayExploreRecipes(trending, 'trendingRecipes');
  
  // Latest recipes
  const latest = recipes.slice(-30).reverse();
  displayExploreRecipes(latest, 'latestRecipes');
  
  // Most saved (using likes as proxy)
  const mostSaved = recipes.sort((a, b) => b.likes - a.likes).slice(0, 15);
  displayExploreRecipes(mostSaved, 'mostSaved');
  
  // Viral (high engagement growth)
  const viral = recipes.filter(r => r.likes > 2000).slice(0, 12);
  displayExploreRecipes(viral, 'viralRecipes');
  
  // Featured chefs (top 12 by followers)
  const topChefs = chefs.sort((a, b) => b.followers - a.followers).slice(0, 12);
  displayFeaturedChefs(topChefs);
}

function displayExploreRecipes(recipes, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = recipes.map(r => createRecipeCard(r)).join('');
}

function displayFeaturedChefs(chefs) {
  const container = document.getElementById('featuredChefs');
  if (!container) return;
  
  container.innerHTML = chefs.map(chef => `
    <div class="chef-card-premium">
      <div class="chef-avatar">${chef.avatar}</div>
      <h3>${chef.username.replace(/_/g, ' ')}</h3>
      <p class="chef-bio">${chef.bio}</p>
      <div class="chef-signature">
        <strong>Signature Dish:</strong> ${chef.signatureDish}
      </div>
      <div class="chef-stats-grid">
        <div class="chef-stat">
          <div class="stat-value">${chef.recipes}</div>
          <div class="stat-label">Recipes</div>
        </div>
        <div class="chef-stat">
          <div class="stat-value">${(chef.followers / 1000).toFixed(1)}K</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="chef-stat">
          <div class="stat-value">${(chef.totalLikes / 1000).toFixed(1)}K</div>
          <div class="stat-label">Likes</div>
        </div>
      </div>
      <div class="chef-badges-mini">
        ${chef.badges.slice(0, 3).map(b => `<span class="badge-mini">${b}</span>`).join('')}
      </div>
      <button class="follow-btn">Follow</button>
    </div>
  `).join('');
}

function updateCuisineRecipeCounts() {
  const { recipes } = SAMPLE_DATA;
  const cuisineCards = document.querySelectorAll('[data-count-cuisine]');
  
  cuisineCards.forEach(card => {
    const cuisine = card.getAttribute('data-count-cuisine');
    const count = recipes.filter(r => r.cuisine === cuisine).length;
    card.textContent = count + ' recipes';
  });
}

function updateDifficultyRecipeCounts() {
  const { recipes } = SAMPLE_DATA;
  
  const easy = recipes.filter(r => r.difficulty === 'Easy').length;
  const medium = recipes.filter(r => r.difficulty === 'Medium').length;
  const hard = recipes.filter(r => r.difficulty === 'Hard').length;
  
  const easyEl = document.getElementById('easyCount');
  const mediumEl = document.getElementById('mediumCount');
  const hardEl = document.getElementById('hardCount');
  
  if (easyEl) easyEl.textContent = easy + ' recipes';
  if (mediumEl) mediumEl.textContent = medium + ' recipes';
  if (hardEl) hardEl.textContent = hard + ' recipes';
}

// ==========================================
// 🎯 CUISINE & FILTER CLICK HANDLERS
// ==========================================
document.addEventListener('click', function(e) {
  // Handle cuisine card clicks
  if (e.target.closest('.cuisine-card-fancy')) {
    const cuisine = e.target.closest('.cuisine-card-fancy').getAttribute('data-cuisine');
    filterRecipesByCuisine(cuisine);
  }
  
  // Handle filter tab clicks
  if (e.target.classList.contains('filter-tab')) {
    const filter = e.target.getAttribute('data-filter');
    handleFilterTabClick(e.target, filter);
  }
  
  // Handle difficulty card clicks
  if (e.target.closest('.difficulty-card')) {
    const difficulty = e.target.closest('.difficulty-card').getAttribute('data-difficulty');
    filterRecipesByDifficulty(difficulty);
  }
});

function filterRecipesByCuisine(cuisine) {
  const recipes = SAMPLE_DATA.recipes.filter(r => r.cuisine === cuisine);
  console.log('Filtering by cuisine:', cuisine, '- Found:', recipes.length);
  // Display filtered recipes (integrate with existing recipe display logic)
  displayFilteredRecipes(recipes, `${cuisine} Recipes (${recipes.length})`);
}

function filterRecipesByDifficulty(difficulty) {
  const recipes = SAMPLE_DATA.recipes.filter(r => r.difficulty === difficulty);
  console.log('Filtering by difficulty:', difficulty, '- Found:', recipes.length);
  displayFilteredRecipes(recipes, `${difficulty} Recipes (${recipes.length})`);
}

function handleFilterTabClick(tab, filter) {
  // Update active state
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  
  if (filter === 'all') {
    loadExplorePageContent();
  } else {
    const recipes = SAMPLE_DATA.recipes.filter(r => 
      r.tags.toLowerCase().includes(filter.toLowerCase()) ||
      r.category.toLowerCase().includes(filter.toLowerCase())
    );
    console.log('Filter:', filter, '- Found:', recipes.length);
  }
}

function displayFilteredRecipes(recipes, title) {
  // Scroll to recipe list or show modal with filtered results
  console.log('Displaying filtered recipes:', title, recipes.length);
  alert(`Found ${recipes.length} ${title}! Feature coming soon - will display these recipes.`);
}

// Export for use in other scripts
window.PREMIUM_DATA_LOADER = {
  loadHomePageContent,
  loadExplorePageContent,
  updateCuisineRecipeCounts,
  createRecipeCard
};

console.log('✨ Premium Data Loader initialized');

// ========================================
// 🎨 TASTELOG PREMIUM - MAIN JAVASCRIPT
// ========================================

let authToken = null;
let currentUser = null;
let isSignup = false;
let allRecipes = [];
let currentDetailRecipe = null;
let selectedTags = [];

// ========================================
// 🛣️ ROUTING & NAVIGATION
// ========================================

function handleRoute() {
  const path = window.location.pathname;
  
  // Check if user is logged in
  authToken = localStorage.getItem('authToken');
  
  // Landing page
  if (path === '/') {
    document.getElementById("landing")?.classList.remove("hidden");
    document.getElementById("auth")?.classList.add("hidden");
    document.getElementById("mainApp")?.classList.add("hidden");
    return;
  }
  
  // Auth routes
  if (path === '/login') {
    showAuth(false);
    return;
  }
  
  if (path === '/signup') {
    showAuth(true);
    return;
  }
  
  // Protected routes - require login
  const protectedRoutes = ['/home', '/dashboard', '/explore', '/my-recipes', '/post-recipe', '/favorites', '/notifications', '/profile', '/settings'];
  
  if (protectedRoutes.includes(path) || path.startsWith('/recipe/')) {
    if (!authToken) {
      // Not logged in - redirect to login
      navigateTo('/login');
      return;
    }
    
    // User is logged in - show the app and correct view
    showMainApp().then(() => {
      switch(path) {
        case '/home':
          showHomeView();
          break;
        case '/dashboard':
          showDashboardView();
          break;
        case '/explore':
          showExploreView();
          break;
        case '/my-recipes':
          showMyRecipesView();
          break;
        case '/post-recipe':
          showHomeView();
          document.getElementById("recipeModal").classList.remove("hidden");
          break;
        default:
          showHomeView();
      }
    });
  }
}

function navigateTo(path) {
  window.history.pushState({}, '', path);
  handleRoute();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', handleRoute);

// Initialize routing on page load
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  handleRoute();
});

// ========================================
// 🌙 DARK MODE
// ========================================

function initDarkMode() {
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === null) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('darkMode', 'true');
  } else if (savedTheme === 'true') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateDarkModeIcon();
}

function updateDarkModeIcon() {
  const current = document.documentElement.getAttribute('data-theme');
  const icon = document.querySelector('#darkModeToggle i');
  if (icon) {
    icon.className = current === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('darkMode', newTheme === 'dark');
  updateDarkModeIcon();
}

// ========================================
// 🔐 AUTH FUNCTIONS
// ========================================

document.getElementById("loginBtnNav")?.addEventListener('click', () => navigateTo('/login'));
document.getElementById("signupBtnNav")?.addEventListener('click', () => navigateTo('/signup'));
document.getElementById("getStarted")?.addEventListener('click', () => navigateTo('/login'));
document.getElementById("switchAuth")?.addEventListener('click', () => {
  navigateTo(isSignup ? '/login' : '/signup');
});

function showAuth(signup) {
  isSignup = signup;
  document.getElementById("landing")?.classList.add("hidden");
  document.getElementById("auth")?.classList.remove("hidden");
  document.getElementById("mainApp")?.classList.add("hidden");
  document.getElementById("authTitle").innerText = signup ? "Sign Up" : "Login";
  document.getElementById("authSubmit").innerText = signup ? "Sign Up" : "Login";
  document.getElementById("switchAuth").innerHTML = signup
    ? 'Already have an account? <span>Login</span>'
    : "Don't have an account? <span>Sign up</span>";
}

document.getElementById("authSubmit")?.addEventListener('click', async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  const endpoint = isSignup ? `${API_BASE_URL}/api/users/signup` : `${API_BASE_URL}/api/users/login`;
  const body = isSignup
    ? { username: email.split("@")[0], email, password }
    : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    if (data.token) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      navigateTo('/home');
    } else if (data.message === "User registered successfully!") {
      alert("Account created! Please login.");
      navigateTo('/login');
    } else {
      alert(data.error || "Authentication failed");
    }
  } catch (err) {
    alert("Error connecting to server");
    console.error(err);
  }
});

// ========================================
// 🏠 SHOW MAIN APP
// ========================================

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

async function showMainApp() {
  document.getElementById("landing")?.classList.add("hidden");
  document.getElementById("auth")?.classList.add("hidden");
  document.getElementById("mainApp")?.classList.remove("hidden");
  
  const decoded = decodeJWT(authToken);
  if (decoded) {
    currentUser = { id: parseInt(decoded.id), email: decoded.email };
  }
  
  initDarkMode();
  await fetchRecipes();
  await fetchUserStats();
  setupEventListeners();
  // Don't call showHomeView() here - let handleRoute() decide which view to show
}

function setupEventListeners() {
  // Navigation
  document.getElementById("homeLink")?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/home');
  });
  
  document.getElementById("dashboardLink")?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/dashboard');
  });
  
  document.getElementById("exploreLink")?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/explore');
  });
  
  // Dark mode
  document.getElementById("darkModeToggle")?.addEventListener('click', toggleDarkMode);
  
  // Profile menu
  const profileIcon = document.getElementById("profileIcon");
  const profileMenu = document.getElementById("profileMenu");
  
  profileIcon?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("show");
  });
  
  document.addEventListener('click', () => {
    profileMenu?.classList.remove("show");
  });
  
  // Logout
  document.getElementById("logoutBtn")?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
  
  // My Recipes
  document.getElementById("myRecipesBtn")?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/my-recipes');
  });
  
  // Add recipe
  const addRecipeBtn = document.getElementById("addRecipeBtn");
  const postRecipeLink = document.getElementById("postRecipeLink");
  const recipeModal = document.getElementById("recipeModal");
  const closeModal = document.getElementById("closeModal");
  
  addRecipeBtn?.addEventListener('click', () => {
    navigateTo('/post-recipe');
  });
  
  postRecipeLink?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/post-recipe');
  });
  
  closeModal?.addEventListener('click', () => {
    recipeModal.classList.add("hidden");
  });
  
  // Post recipe
  document.getElementById("postRecipeBtn")?.addEventListener('click', postRecipe);
  
  // Tag selection
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });
  
  // Search
  document.getElementById("searchBtn")?.addEventListener('click', performSearch);
  document.getElementById("searchInput")?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  
  // Recipe detail modal close
  document.getElementById("closeDetailModal")?.addEventListener('click', () => {
    document.getElementById("recipeDetailModal").classList.add("hidden");
  });
  
  // Notifications
  document.getElementById("notificationIcon")?.addEventListener('click', showNotifications);
  document.getElementById("closeNotifications")?.addEventListener('click', () => {
    document.getElementById("notificationsPanel").classList.add("hidden");
  });
  
  // Click outside modal to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  });
}

function showHomeView() {
  document.getElementById("recipeList").classList.remove("hidden");
  document.getElementById("dashboardView").classList.add("hidden");
  document.getElementById("myRecipesView").classList.add("hidden");
  document.getElementById("exploreView").classList.add("hidden");
}

function showDashboardView() {
  document.getElementById("recipeList").classList.add("hidden");
  document.getElementById("dashboardView").classList.remove("hidden");
  document.getElementById("myRecipesView").classList.add("hidden");
  document.getElementById("exploreView").classList.add("hidden");
  renderDashboard();
}

function showMyRecipesView() {
  document.getElementById("recipeList").classList.add("hidden");
  document.getElementById("dashboardView").classList.add("hidden");
  document.getElementById("myRecipesView").classList.remove("hidden");
  document.getElementById("exploreView").classList.add("hidden");
  renderMyRecipes();
}

function showExploreView() {
  document.getElementById("recipeList").classList.add("hidden");
  document.getElementById("dashboardView").classList.add("hidden");
  document.getElementById("myRecipesView").classList.add("hidden");
  document.getElementById("exploreView").classList.remove("hidden");
  renderExploreView();
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  navigateTo('/');
  location.reload();
}

// ========================================
// 🍳 RECIPE FUNCTIONS
// ========================================

async function fetchRecipes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes`);
    const recipes = await res.json();
    allRecipes = recipes;
    renderHomepageSections();
  } catch (err) {
    console.error("Error fetching recipes:", err);
  }
}

function renderHomepageSections(recipes = allRecipes) {
  const containers = {
    all: document.getElementById("allRecipes"),
    veg: document.getElementById("vegRecipes"),
    nonVeg: document.getElementById("nonVegRecipes"),
    quick: document.getElementById("quickRecipes"),
    vegan: document.getElementById("veganRecipes")
  };

  // Clear all containers
  Object.values(containers).forEach(c => {
    if (c) c.innerHTML = "";
  });

  if (!recipes || recipes.length === 0) {
    if (containers.all) {
      containers.all.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <p style="font-size: 1.2rem; color: var(--text-secondary);">
            No recipes yet. Be the first to share! 🍳
          </p>
        </div>
      `;
    }
    return;
  }

  // Render all recipes
  recipes.forEach(r => {
    if (containers.all) {
      containers.all.innerHTML += makeRecipeCard(r);
    }

    // Categorize
    const tagList = (r.tags || "").split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    
    if ((tagList.includes("veg") || /veg|vegetarian/i.test(r.tags)) && !/non/i.test(r.tags)) {
      if (containers.veg) containers.veg.innerHTML += makeRecipeCard(r);
    }
    
    if (tagList.includes("non-veg") || /non[- ]?veg/i.test(r.tags)) {
      if (containers.nonVeg) containers.nonVeg.innerHTML += makeRecipeCard(r);
    }
    
    if (tagList.includes("quick") || /quick/i.test(r.tags) || (r.cook_time && r.cook_time <= 30)) {
      if (containers.quick) containers.quick.innerHTML += makeRecipeCard(r);
    }
    
    if (tagList.includes("vegan") || /vegan/i.test(r.tags)) {
      if (containers.vegan) containers.vegan.innerHTML += makeRecipeCard(r);
    }
  });

  // Show empty states
  Object.entries(containers).forEach(([key, container]) => {
    if (container && container.children.length === 0 && key !== 'all') {
      container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No recipes found.</p>`;
    }
  });

  // Attach click handlers
  setupRecipeCardClicks();
}

function makeRecipeCard(r) {
  const difficultyColor = {
    'Easy': '#06d6a0',
    'Medium': '#f77f00',
    'Hard': '#ff4757'
  };
  
  return `
    <div class="recipe-card" data-id="${r.id}">
      <span class="recipe-badge" style="background: ${difficultyColor[r.difficulty] || '#667eea'};">
        ${r.difficulty || 'Medium'}
      </span>
      <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}" 
           alt="${r.name}" 
           loading="lazy">
      <h3>${r.name}</h3>
      <div class="recipe-actions">
        <span><i class="fas fa-heart"></i> ${r.likes || 0}</span>
        <span><i class="fas fa-star"></i> ${r.avgRating ? r.avgRating.toFixed(1) : '0'}</span>
        <span><i class="fas fa-clock"></i> ${r.cook_time || '-'} min</span>
      </div>
    </div>
  `;
}

function setupRecipeCardClicks() {
  document.querySelectorAll(".recipe-card").forEach(card => {
    card.addEventListener('click', async (e) => {
      if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) {
        return;
      }
      const id = card.dataset.id;
      await openRecipeDetail(id);
    });
  });
}

function renderMyRecipes() {
  const container = document.getElementById("myRecipesContainer");
  if (!container) return;
  
  if (!currentUser) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Please login to see your recipes.</p>';
    return;
  }
  
  const myRecipes = allRecipes.filter(r => r.user_id === currentUser.id);
  
  if (myRecipes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="font-size: 1.2rem; color: var(--text-secondary);">
          You haven't posted any recipes yet. Share your first recipe! 🍳
        </p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  myRecipes.forEach(r => {
    container.innerHTML += makeRecipeCardWithActions(r);
  });
  
  setupRecipeCardClicks();
  setupEditDeleteButtons();
}

function makeRecipeCardWithActions(r) {
  const difficultyColor = {
    'Easy': '#06d6a0',
    'Medium': '#f77f00',
    'Hard': '#ff4757'
  };
  
  return `
    <div class="recipe-card" data-id="${r.id}">
      <span class="recipe-badge" style="background: ${difficultyColor[r.difficulty] || '#667eea'};">
        ${r.difficulty || 'Medium'}
      </span>
      <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}" 
           alt="${r.name}" 
           loading="lazy">
      <h3>${r.name}</h3>
      <div class="recipe-actions">
        <span><i class="fas fa-heart"></i> ${r.likes || 0}</span>
        <span><i class="fas fa-star"></i> ${r.avgRating ? r.avgRating.toFixed(1) : '0'}</span>
        <span><i class="fas fa-clock"></i> ${r.cook_time || '-'} min</span>
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="edit-btn" data-id="${r.id}" style="flex: 1; padding: 0.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="delete-btn" data-id="${r.id}" style="flex: 1; padding: 0.5rem; background: #ff4757; color: white; border: none; border-radius: 8px; cursor: pointer;">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `;
}

function setupEditDeleteButtons() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      editRecipe(id);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      await deleteRecipe(id);
    });
  });
}

function renderExploreView() {
  renderTrendingRecipes();
  renderFeaturedChefs();
  renderLatestRecipes();
  setupCuisineCards();
}

function renderTrendingRecipes() {
  const container = document.getElementById("trendingRecipes");
  if (!container) return;
  
  const trending = allRecipes
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 6);
  
  if (trending.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No trending recipes yet. Start sharing!</p>';
    return;
  }
  
  container.innerHTML = '';
  trending.forEach(r => {
    container.innerHTML += makeRecipeCard(r);
  });
  
  setupRecipeCardClicks();
}

function renderFeaturedChefs() {
  const container = document.getElementById("featuredChefs");
  if (!container) return;
  
  const chefStats = {};
  allRecipes.forEach(r => {
    if (!chefStats[r.user_id]) {
      chefStats[r.user_id] = {
        id: r.user_id,
        recipesCount: 0,
        totalLikes: 0
      };
    }
    chefStats[r.user_id].recipesCount++;
    chefStats[r.user_id].totalLikes += (r.likes || 0);
  });
  
  const topChefs = Object.values(chefStats)
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 4);
  
  if (topChefs.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No chefs yet. Be the first to share recipes!</p>';
    return;
  }
  
  container.innerHTML = '';
  topChefs.forEach((chef, index) => {
    const badges = ['👑 Top Chef', '⭐ Rising Star', '🔥 Hot Chef', '💎 Featured'];
    const emojis = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '🍳'];
    container.innerHTML += `
      <div class="chef-card">
        <div class="chef-avatar">${emojis[index % emojis.length]}</div>
        <div class="chef-name">Chef #${chef.id}</div>
        <div class="chef-stats">
          ${chef.recipesCount} recipes • ${chef.totalLikes} likes
        </div>
        <div class="chef-badge">${badges[index]}</div>
      </div>
    `;
  });
}

function renderLatestRecipes() {
  const container = document.getElementById("latestRecipes");
  if (!container) return;
  
  const latest = [...allRecipes]
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);
  
  if (latest.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No recipes yet. Share your first recipe!</p>';
    return;
  }
  
  container.innerHTML = '';
  latest.forEach(r => {
    container.innerHTML += makeRecipeCard(r);
  });
  
  setupRecipeCardClicks();
}

function setupCuisineCards() {
  document.querySelectorAll('.cuisine-card').forEach(card => {
    card.addEventListener('click', () => {
      const cuisine = card.dataset.cuisine;
      filterByCuisine(cuisine);
    });
  });
}

function filterByCuisine(cuisine) {
  const filtered = allRecipes.filter(r => 
    r.category && r.category.toLowerCase() === cuisine.toLowerCase()
  );
  
  if (filtered.length === 0) {
    alert(`No ${cuisine} recipes found yet! Be the first to share one! 🍳`);
    return;
  }
  
  showHomeView();
  
  const container = document.getElementById("allRecipes");
  if (container) {
    container.innerHTML = '';
    filtered.forEach(r => {
      container.innerHTML += makeRecipeCard(r);
    });
    setupRecipeCardClicks();
  }
  
  document.querySelector('.recipes-section h2').innerHTML = `${cuisine} Recipes 🌍`;
}

let editingRecipeId = null;

function editRecipe(id) {
  const recipe = allRecipes.find(r => r.id == id);
  if (!recipe) return;
  
  editingRecipeId = id;
  
  document.getElementById("recipeModalTitle").innerText = "Edit Recipe ✏️";
  document.getElementById("recipeName").value = recipe.name;
  document.getElementById("ingredients").value = recipe.ingredients;
  document.getElementById("instructions").value = recipe.instructions;
  document.getElementById("cuisine").value = recipe.category || '';
  document.getElementById("difficulty").value = recipe.difficulty || 'Medium';
  document.getElementById("cookTime").value = recipe.cook_time || '';
  document.getElementById("calories").value = recipe.calories || '';
  document.getElementById("servings").value = recipe.servings || '';
  document.getElementById("imageUrl").value = recipe.image_url || '';
  
  const tags = (recipe.tags || '').split(',').map(t => t.trim());
  document.querySelectorAll('.tag-btn').forEach(btn => {
    if (tags.includes(btn.dataset.tag)) {
      btn.classList.add('active');
    }
  });
  
  document.getElementById("recipeModal").classList.remove("hidden");
}

async function deleteRecipe(id) {
  if (!confirm("Are you sure you want to delete this recipe?")) return;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alert("Recipe deleted! 🗑️");
      allRecipes = allRecipes.filter(r => r.id != id);
      renderMyRecipes();
    } else {
      alert(data.error || "Failed to delete recipe");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting recipe");
  }
}

async function openRecipeDetail(id) {
  const recipe = allRecipes.find(r => r.id == id);
  if (!recipe) return;

  currentDetailRecipe = recipe;
  
  // Track view
  if (authToken) {
    await fetch(`${API_BASE_URL}/api/recipes/${id}/view`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    }).catch(() => {});
  }
  
  // Populate modal
  document.getElementById("detailName").innerText = recipe.name;
  document.getElementById("detailImage").src = recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
  document.getElementById("detailIngredients").innerText = recipe.ingredients;
  document.getElementById("detailInstructions").innerText = recipe.instructions;
  document.getElementById("detailCuisine").innerText = recipe.category || '-';
  document.getElementById("detailCookTime").innerText = recipe.cook_time || '-';
  document.getElementById("detailCalories").innerText = recipe.calories || '-';
  document.getElementById("detailServings").innerText = recipe.servings || '4';
  document.getElementById("detailDifficulty").innerText = recipe.difficulty || 'Medium';
  
  // Likes
  document.getElementById("likeCount").innerText = recipe.likes || 0;
  
  const likeBtn = document.getElementById("likeBtn");
  likeBtn.onclick = async () => {
    if (!authToken) return alert("Login to like recipes! 🍰");
    await toggleLike(recipe.id);
  };
  
  // Favorite
  const favoriteBtn = document.getElementById("favoriteBtn");
  favoriteBtn.onclick = async () => {
    if (!authToken) return alert("Login to save favorites! 🍰");
    await toggleFavorite(recipe.id);
  };
  
  // Share
  document.getElementById("shareBtn").onclick = () => {
    const url = window.location.origin + `/?recipe=${recipe.id}`;
    navigator.clipboard.writeText(url);
    alert("Recipe link copied to clipboard! 📋");
  };
  
  // Rating
  document.getElementById("avgRating").innerText = recipe.avgRating ? recipe.avgRating.toFixed(1) : "0";
  document.getElementById("ratingsCount").innerText = recipe.ratingsCount || 0;
  
  // Rating stars
  const stars = document.querySelectorAll('#ratingStars i');
  stars.forEach(star => {
    star.onclick = async function() {
      if (!authToken) return alert("Login to rate recipes! 🍰");
      const rating = parseInt(this.dataset.rating);
      await rateRecipe(recipe.id, rating);
      
      // Update stars visual
      stars.forEach((s, idx) => {
        s.className = idx < rating ? 'fas fa-star' : 'far fa-star';
      });
    };
  });
  
  // Comments
  await loadComments(recipe.id);
  
  document.getElementById("commentBtn").onclick = async () => {
    if (!authToken) return alert("Login to comment! 🍰");
    const text = document.getElementById("commentInput").value.trim();
    if (!text) return alert("Type something! 🍰");
    
    await addComment(recipe.id, text);
    document.getElementById("commentInput").value = '';
    await loadComments(recipe.id);
  };
  
  // Show modal
  document.getElementById("recipeDetailModal").classList.remove("hidden");
}

async function toggleLike(recipeId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/like`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    const data = await res.json();
    document.getElementById("likeCount").innerText = data.likesCount;
    
    // Update in allRecipes
    const recipe = allRecipes.find(r => r.id == recipeId);
    if (recipe) recipe.likes = data.likesCount;
  } catch (err) {
    console.error(err);
  }
}

async function toggleFavorite(recipeId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/favorite`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    const data = await res.json();
    alert(data.message || "Updated favorites!");
  } catch (err) {
    console.error(err);
  }
}

async function rateRecipe(recipeId, rating) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/rate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rating })
    });
    const data = await res.json();
    document.getElementById("avgRating").innerText = data.avgRating.toFixed(1);
    document.getElementById("ratingsCount").innerText = data.ratingsCount;
  } catch (err) {
    console.error(err);
  }
}

async function loadComments(recipeId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments`);
    const data = await res.json();
    
    const commentsList = document.getElementById("commentsList");
    if (data.comments && data.comments.length > 0) {
      commentsList.innerHTML = data.comments.map(c => `
        <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 10px; margin-bottom: 0.8rem;">
          <strong>${c.username}</strong>
          <p style="margin: 0.5rem 0;">${c.comment}</p>
          <small style="color: var(--text-light);">${new Date(c.created_at).toLocaleDateString()}</small>
        </div>
      `).join('');
    } else {
      commentsList.innerHTML = '<p style="color: var(--text-secondary);">No comments yet. Be the first!</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

async function addComment(recipeId, comment) {
  try {
    await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ comment })
    });
  } catch (err) {
    console.error(err);
  }
}

function clearRecipeForm() {
  editingRecipeId = null;
  document.getElementById("recipeModalTitle").innerText = "Add New Recipe 🍰";
  document.getElementById("recipeName").value = '';
  document.getElementById("ingredients").value = '';
  document.getElementById("instructions").value = '';
  document.getElementById("cuisine").value = '';
  document.getElementById("difficulty").value = 'Medium';
  document.getElementById("cookTime").value = '';
  document.getElementById("calories").value = '';
  document.getElementById("servings").value = '4';
  document.getElementById("imageUrl").value = '';
  
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

async function postRecipe() {
  if (!authToken) return alert("Please login first!");

  const name = document.getElementById("recipeName").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const instructions = document.getElementById("instructions").value.trim();
  const category = document.getElementById("cuisine").value;
  const difficulty = document.getElementById("difficulty").value;
  const cook_time = parseInt(document.getElementById("cookTime").value) || null;
  const calories = parseInt(document.getElementById("calories").value) || null;
  const servings = parseInt(document.getElementById("servings").value) || 4;
  const image_url = document.getElementById("imageUrl").value.trim();

  if (!name || !ingredients || !instructions) {
    return alert("Please fill in all required fields!");
  }

  const tags = Array.from(document.querySelectorAll('.tag-btn.active'))
    .map(btn => btn.dataset.tag)
    .join(', ');

  const isEditing = editingRecipeId !== null;
  const url = isEditing ? `/api/recipes/${editingRecipeId}` : "/api/recipes";
  const method = isEditing ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        ingredients,
        instructions,
        category,
        tags,
        image_url,
        difficulty,
        cook_time,
        calories,
        servings
      })
    });

    const data = await res.json();
    
    if (res.ok) {
      alert(isEditing ? "Recipe updated! ✏️" : "Recipe posted successfully! 🎉");
      document.getElementById("recipeModal").classList.add("hidden");
      await fetchRecipes();
      clearRecipeForm();
      if (isEditing) {
        renderMyRecipes();
      }
    } else {
      alert(data.error || `Failed to ${isEditing ? 'update' : 'post'} recipe`);
    }
  } catch (err) {
    alert(`Error ${isEditing ? 'updating' : 'posting'} recipe`);
    console.error(err);
  }
}

// ========================================
// 🔍 SEARCH
// ========================================

async function performSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    await fetchRecipes();
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/search?name=${encodeURIComponent(query)}`);
    const recipes = await res.json();
    allRecipes = recipes;
    renderHomepageSections();
  } catch (err) {
    console.error(err);
  }
}

// ========================================
// 📊 DASHBOARD & STATS
// ========================================

async function fetchUserStats() {
  if (!authToken) return;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/stats`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const stats = await res.json();
    currentUser = { ...currentUser, ...stats };
  } catch (err) {
    console.error(err);
  }
}

async function renderDashboard() {
  // Fetch fresh stats
  await fetchUserStats();
  
  if (!currentUser) {
    document.getElementById("statRecipes").innerText = "0";
    document.getElementById("statLikes").innerText = "0";
    document.getElementById("statRating").innerText = "0";
    document.getElementById("statFollowers").innerText = "0";
    document.getElementById("statViews").innerText = "0";
    document.getElementById("statComments").innerText = "0";
    document.getElementById("userLevel").innerText = "Novice Chef";
    document.getElementById("userPoints").innerText = "0";
    return;
  }

  // Update stat cards
  document.getElementById("statRecipes").innerText = currentUser.recipes_count || 0;
  document.getElementById("statLikes").innerText = currentUser.total_likes || 0;
  document.getElementById("statRating").innerText = currentUser.avg_rating ? currentUser.avg_rating.toFixed(1) : "0";
  document.getElementById("statFollowers").innerText = currentUser.followers_count || 0;
  document.getElementById("statViews").innerText = currentUser.total_views || 0;
  document.getElementById("statComments").innerText = currentUser.total_comments || 0;
  document.getElementById("userLevel").innerText = currentUser.user_level || "Novice Chef";
  document.getElementById("userPoints").innerText = currentUser.points || 0;

  // Update community impact
  document.getElementById("impactViews").innerText = currentUser.total_views || 0;
  document.getElementById("impactSaves").innerText = currentUser.total_saves || 0;
  document.getElementById("impactShares").innerText = Math.floor((currentUser.total_saves || 0) * 0.3);

  // Update level progress bar
  const levelProgress = Math.min(((currentUser.points || 0) % 50) * 2, 100);
  document.getElementById("levelProgress").style.width = levelProgress + '%';

  // Render badges
  const badgesContainer = document.getElementById("userBadges");
  if (currentUser.badges && currentUser.badges.length > 0) {
    badgesContainer.innerHTML = currentUser.badges.map(b => `
      <div class="badge-item">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
      </div>
    `).join('');
  } else {
    badgesContainer.innerHTML = `
      <div class="badge-placeholder">
        <div class="badge-lock">🔒</div>
        <p>Start posting to unlock badges!</p>
      </div>
    `;
  }

  // Update monthly goals
  if (currentUser.monthly) {
    updateMonthlyGoal('recipes', currentUser.monthly.recipes, 5);
    updateMonthlyGoal('likes', currentUser.monthly.likes, 100);
    updateMonthlyGoal('followers', currentUser.monthly.followers, 50);
  }

  // Fetch and render additional dashboard data
  await Promise.all([
    fetchAndRenderTopRecipes(),
    fetchAndRenderActivityTimeline(),
    fetchAndRenderCharts()
  ]);
}

function updateMonthlyGoal(type, current, target) {
  const percentage = Math.min((current / target) * 100, 100);
  const goalElement = document.querySelector(`[data-goal="${type}"]`);
  if (goalElement) {
    const progressBar = goalElement.querySelector('.goal-progress-fill');
    const progressText = goalElement.querySelector('.goal-progress-text');
    if (progressBar) progressBar.style.width = percentage + '%';
    if (progressText) progressText.textContent = `${current}/${target}`;
  }
}

async function fetchAndRenderTopRecipes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/top-recipes`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    const tbody = document.getElementById("topRecipesBody");
    if (!tbody) return;
    
    if (!data.recipes || data.recipes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            No recipes posted yet. Start creating to see your top performers! 🍳
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = data.recipes.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.views}</td>
        <td>${r.likes}</td>
        <td>${r.rating ? parseFloat(r.rating).toFixed(1) : '0.0'}</td>
        <td>${r.comments}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error("Error fetching top recipes:", err);
  }
}

async function fetchAndRenderActivityTimeline() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/activity`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    const timeline = document.getElementById("activityTimeline");
    if (!timeline) return;
    
    if (!data.activities || data.activities.length === 0) {
      timeline.innerHTML = `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <p>Welcome to TasteLog! Start your culinary journey by posting your first recipe.</p>
            <span class="timeline-time">Just now</span>
          </div>
        </div>
      `;
      return;
    }
    
    timeline.innerHTML = data.activities.map(activity => {
      const timeAgo = getTimeAgo(new Date(activity.created_at));
      let message = '';
      
      switch(activity.type) {
        case 'recipe':
          message = `You posted a new recipe: <strong>${activity.title}</strong>`;
          break;
        case 'like':
          message = `Your recipe <strong>${activity.title}</strong> received a like ❤️`;
          break;
        case 'comment':
          message = `Someone commented on <strong>${activity.title}</strong> 💬`;
          break;
        case 'badge':
          message = `You earned the <strong>${activity.title}</strong> badge! 🏆`;
          break;
      }
      
      return `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <p>${message}</p>
            <span class="timeline-time">${timeAgo}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error("Error fetching activity timeline:", err);
  }
}

async function fetchAndRenderCharts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/chart-data`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    // Views over time chart
    renderActivityChart(data.viewsOverTime);
    
    // Engagement chart
    renderEngagementChart(data.engagement);
  } catch (err) {
    console.error("Error fetching chart data:", err);
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return "Just now";
}

function renderActivityChart(viewsData) {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (window.activityChartInstance) {
    window.activityChartInstance.destroy();
  }

  const labels = viewsData ? viewsData.map(d => d.date) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = viewsData ? viewsData.map(d => d.views) : [0, 0, 0, 0, 0, 0, 0];

  window.activityChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Recipe Views',
        data: data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderEngagementChart(engagement) {
  const ctx = document.getElementById('engagementChart');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (window.engagementChartInstance) {
    window.engagementChartInstance.destroy();
  }

  const data = engagement ? [engagement.likes, engagement.comments, engagement.saves] : [0, 0, 0];

  window.engagementChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Likes', 'Comments', 'Saves'],
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(240, 147, 251, 0.8)',
          'rgba(102, 126, 234, 0.8)',
          'rgba(67, 233, 123, 0.8)'
        ],
        borderColor: [
          'rgba(240, 147, 251, 1)',
          'rgba(102, 126, 234, 1)',
          'rgba(67, 233, 123, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// ========================================
// 🔔 NOTIFICATIONS
// ========================================

async function showNotifications() {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    const notificationsList = document.getElementById("notificationsList");
    if (data.notifications && data.notifications.length > 0) {
      notificationsList.innerHTML = data.notifications.map(n => `
        <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 10px; margin-bottom: 0.8rem; ${n.is_read ? '' : 'border-left: 3px solid var(--primary);'}">
          <p>${n.message}</p>
          <small style="color: var(--text-light);">${new Date(n.created_at).toLocaleDateString()}</small>
        </div>
      `).join('');
      
      document.getElementById("notificationCount").innerText = data.unread_count;
    } else {
      notificationsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No notifications yet! 🔔</p>';
    }
    
    document.getElementById("notificationsPanel").classList.remove("hidden");
    
    // Mark as read
    await fetch(`${API_BASE_URL}/api/notifications/read`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    document.getElementById("notificationCount").innerText = "0";
  } catch (err) {
    console.error(err);
  }
}

// ========================================
// 🔍 VIEW ALL RECIPES MODAL
// ========================================

function setupViewAllButtons() {
  const viewAllButtons = document.querySelectorAll('.view-more-btn[data-category]');
  
  viewAllButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      openViewAllModal(category);
    });
  });
  
  const closeViewAll = document.getElementById('closeViewAll');
  if (closeViewAll) {
    closeViewAll.addEventListener('click', () => {
      document.getElementById('viewAllModal').classList.add('hidden');
    });
  }
  
  const viewAllModal = document.getElementById('viewAllModal');
  if (viewAllModal) {
    viewAllModal.addEventListener('click', (e) => {
      if (e.target === viewAllModal) {
        viewAllModal.classList.add('hidden');
      }
    });
  }
}

function openViewAllModal(category) {
  const { recipes } = SAMPLE_DATA;
  let filteredRecipes = [];
  let title = '';
  
  if (category === 'Vegetarian') {
    filteredRecipes = recipes.filter(r => r.category === 'Vegetarian');
    title = 'All Vegetarian Recipes 🌱';
  } else if (category === 'Non-Veg') {
    filteredRecipes = recipes.filter(r => r.category === 'Non-Veg');
    title = 'All Non-Veg Recipes 🍗';
  } else if (category === 'Quick Recipes') {
    filteredRecipes = recipes.filter(r => r.cookTime <= 30).sort((a, b) => a.cookTime - b.cookTime);
    title = 'All Quick Recipes ⚡';
  } else if (category === 'Vegan') {
    filteredRecipes = recipes.filter(r => r.category === 'Vegan');
    title = 'All Vegan Recipes 🥬';
  }
  
  document.getElementById('viewAllTitle').textContent = title;
  document.getElementById('viewAllCount').textContent = `${filteredRecipes.length} ${category} Recipes`;
  
  const viewAllGrid = document.getElementById('viewAllGrid');
  viewAllGrid.innerHTML = filteredRecipes.map(r => `
    <div class="recipe-card" onclick="viewRecipeDetails(${r.id})">
      <div class="recipe-image-emoji">${r.image}</div>
      <div class="recipe-card-content">
        <h4>${r.name}</h4>
        <p class="recipe-chef">by ${r.chef}</p>
        <div class="recipe-tags">
          <span class="recipe-tag">${r.cuisine}</span>
          <span class="recipe-tag ${r.difficulty.toLowerCase()}">${r.difficulty}</span>
        </div>
        <div class="recipe-stats">
          <span title="Rating">⭐ ${r.avgRating.toFixed(1)}</span>
          <span title="Likes">❤️ ${r.likes}</span>
          <span title="Cook Time">⏱️ ${r.cookTime}m</span>
        </div>
      </div>
    </div>
  `).join('');
  
  document.getElementById('viewAllModal').classList.remove('hidden');
}

// ========================================
// 🚀 INITIALIZE
// ========================================

initDarkMode();

// Setup View All buttons when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(setupViewAllButtons, 500);
});
