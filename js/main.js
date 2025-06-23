// Main application logic for FoodShare platform
document.addEventListener('DOMContentLoaded', function() {
  // Initialize managers
  const storage = new StorageManager();
  const auth = new AuthManager(storage);
  const admin = new AdminManager(storage, auth);
  const dashboard = new DashboardManager(storage, auth);
  const reviews = new ReviewManager(storage, auth);

  // DOM elements
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const adminModal = document.getElementById('admin-modal');
  const userDashboard = document.getElementById('user-dashboard');
  const adminDashboard = document.getElementById('admin-dashboard');
  const mainContent = document.getElementById('main-content');
  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');

  // Navigation elements
  const navLinks = document.querySelectorAll('.nav-link');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  // Initialize the application
  init();

  function init() {
    setupEventListeners();
    updateNavigation();
    updateImpactStats();
    reviews.updateTopDonorDisplay();
    reviews.initializeReviewForm();
  }

  function setupEventListeners() {
    // Navigation
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

    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('admin-form').addEventListener('submit', handleAdminLogin);

    // Register type selection
    document.getElementById('donor-type').addEventListener('click', () => {
      selectRegisterType('donor');
    });

    document.getElementById('receiver-type').addEventListener('click', () => {
      selectRegisterType('receiver');
    });

    // Modal switching links
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.style.display = 'none';
      showRegisterModal();
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      registerModal.style.display = 'none';
      showLoginModal();
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            // Close mobile menu
            navMenu.classList.remove('active');
          }
        }
      });
    });
};
});