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
    // Hero buttons
    document.getElementById('donate-food-btn').addEventListener('click', () => {
      if (auth.isUserLoggedIn() && auth.getCurrentUser().type === 'donor') {
        showUserDashboard();
      } else {
        showRegisterModal('donor');
      }
    });

document.getElementById('find-food-btn').addEventListener('click', () => {
      if (auth.isUserLoggedIn() && auth.getCurrentUser().type === 'receiver') {
        showUserDashboard();
      } else {
        showRegisterModal('receiver');
      }
    });
    // Modal close buttons
    document.getElementById('login-close').addEventListener('click', () => {
      loginModal.style.display = 'none';
    });

    document.getElementById('register-close').addEventListener('click', () => {
      registerModal.style.display = 'none';
    });

    document.getElementById('admin-close').addEventListener('click', () => {
      adminModal.style.display = 'none';
    }); 
    // Dashboard close buttons
    document.getElementById('close-dashboard').addEventListener('click', () => {
      userDashboard.style.display = 'none';
      mainContent.style.display = 'block';
    });

    document.getElementById('close-admin-dashboard').addEventListener('click', () => {
      adminDashboard.style.display = 'none';
      mainContent.style.display = 'block';
    });


    
  }





})