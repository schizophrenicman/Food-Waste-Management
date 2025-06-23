document.addEventListener('DOMContentLoaded',function(){
    const storage = new StorageManager();
    const auth = new AuthManager(storage);
    const admin = new DashboardManager(storage,auth);
    const reviews = new ReviewManager(storage,auth);

    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const adminModal = document.getElementById('admin-modal');
    const userDashboard = document.getElementById('user-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');
    const mainContent = document.getElementById('main-content');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');

    // Navigation 
  const navLinks = document.querySelectorAll('.nav-link');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  // Initialize 
  init();

   function init() {
    setupEventListeners();
    updateNavigation();
    updateImpactStats();
    reviews.updateTopDonorDisplay();
    reviews.initializeReviewForm();
  }
  function setupEventListeners(){
     document.getElementById('register-link').addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterModal();
    });

    document.getElementById('login-link').addEventListener('click', (e) => {
      e.preventDefault();
      showLoginModal();
    });

    document.getElementById('admin-link').addEventListener('click', (e) => {
      e.preventDefault();
      showAdminModal();
    });

    document.getElementById('logout-btn').addEventListener('click', logout);
  }





})