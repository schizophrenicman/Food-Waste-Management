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

    // Admin dashboard tabs
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        const tab = e.target.dataset.tab;
        showAdminTab(tab);
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
      }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === loginModal) loginModal.style.display = 'none';
      if (e.target === registerModal) registerModal.style.display = 'none';
      if (e.target === adminModal) adminModal.style.display = 'none';
    });
  }

  function showLoginModal() {
    loginModal.style.display = 'block';
    document.getElementById('login-form').reset();
  }

  function showRegisterModal(type = null) {
    registerModal.style.display = 'block';
    // Scroll modal content to top when shown
    const modalContent = registerModal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
    document.getElementById('register-form').reset();
    if (type) {
      selectRegisterType(type);
    } else {
      selectRegisterType('donor'); // Default to donor
    }
  }

  function showAdminModal() {
    adminModal.style.display = 'block';
    document.getElementById('admin-form').reset();
  }

  function selectRegisterType(type) {
    const donorBtn = document.getElementById('donor-type');
    const receiverBtn = document.getElementById('receiver-type');
    const documentGroup = document.getElementById('document-upload-group');

    if (type === 'donor') {
      donorBtn.classList.add('active');
      receiverBtn.classList.remove('active');
      documentGroup.style.display = 'none';
    } else {
      receiverBtn.classList.add('active');
      donorBtn.classList.remove('active');
      documentGroup.style.display = 'block';
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const result = await auth.loginUser(email, password);
    
    if (result.success) {
      loginModal.style.display = 'none';
      updateNavigation();
      showAlert('Login successful!', 'success');
      showUserDashboard();
    } else {
      showAlert(result.message, 'error');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    
    const userData = {
      name: document.getElementById('register-name').value,
      email: document.getElementById('register-email').value,
      password: document.getElementById('register-password').value,
      phone: document.getElementById('register-phone').value,
      type: document.getElementById('donor-type').classList.contains('active') ? 'donor' : 'receiver'
    };

    // Handle document upload for receivers
    if (userData.type === 'receiver') {
      const fileInput = document.getElementById('verification-document');
      if (fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = async function(e) {
          userData.document = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result
          };
          await processRegistration(userData);
        };
        reader.readAsDataURL(file);
      } else {
        showAlert('Please upload a verification document', 'error');
        return;
      }
    } else {
      await processRegistration(userData);
    }
  }

  async function processRegistration(userData) {
    const result = await auth.registerUser(userData);
    
    if (result.success) {
      registerModal.style.display = 'none';
      showAlert(result.message, 'success');
      document.getElementById('register-form').reset();
    } else {
      showAlert(result.message, 'error');
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    const result = await auth.loginAdmin(email, password);
    
    if (result.success) {
      adminModal.style.display = 'none';
      showAdminDashboard();
      showAlert('Admin login successful!', 'success');
    } else {
      showAlert(result.message, 'error');
    }
  }

  function logout() {
    auth.logout();
    updateNavigation();
    userDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    mainContent.style.display = 'block';
    showAlert('Logged out successfully!', 'success');
  }

  function updateNavigation() {
    const user = auth.getCurrentUser();
    const admin = auth.getCurrentAdmin();
    
    if (user) {
      userInfo.style.display = 'flex';
      userName.textContent = user.name;
      document.getElementById('register-link').style.display = 'none';
      document.getElementById('login-link').style.display = 'none';
    } else if (admin) {
      userInfo.style.display = 'flex';
      userName.textContent = `Admin: ${admin.name}`;
      document.getElementById('register-link').style.display = 'none';
      document.getElementById('login-link').style.display = 'none';
    } else {
      userInfo.style.display = 'none';
      document.getElementById('register-link').style.display = 'block';
      document.getElementById('login-link').style.display = 'block';
    }
  }

  function showUserDashboard() {
    if (!auth.isUserLoggedIn()) {
      showLoginModal();
      return;
    }

    const user = auth.getCurrentUser();
    document.getElementById('dashboard-title').textContent = `${user.type === 'donor' ? 'Donor' : 'Receiver'} Dashboard`;
    
    const dashboardContent = document.getElementById('dashboard-content');
    dashboardContent.innerHTML = dashboard.generateDashboardContent();
    
    mainContent.style.display = 'none';
    userDashboard.style.display = 'block';

    // Setup dashboard event listeners
    setupDashboardEventListeners();
  }

  function setupDashboardEventListeners() {
    // Add donation button
    const addDonationBtn = document.getElementById('add-donation-btn');
    if (addDonationBtn) {
      addDonationBtn.addEventListener('click', () => {
        document.getElementById('add-donation-modal').style.display = 'block';
      });
    }

    // Add donation modal close
    const addDonationClose = document.getElementById('add-donation-close');
    if (addDonationClose) {
      addDonationClose.addEventListener('click', () => {
        document.getElementById('add-donation-modal').style.display = 'none';
      });
    }

    // Add donation form
    const addDonationForm = document.getElementById('add-donation-form');
    if (addDonationForm) {
      addDonationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const donationData = {
          foodName: document.getElementById('food-name').value,
          description: document.getElementById('food-description').value,
          quantity: document.getElementById('food-quantity').value,
          pickupLocation: document.getElementById('pickup-location').value,
          expiryDate: document.getElementById('expiry-date').value
        };
        
        const result = await dashboard.createDonation(donationData);
        
        if (result.success) {
          document.getElementById('add-donation-modal').style.display = 'none';
          showAlert(result.message, 'success');
          showUserDashboard(); // Refresh dashboard
          updateImpactStats();
        } else {
          showAlert(result.message, 'error');
        }
      });
    }
  }

  function showAdminDashboard() {
    if (!auth.isAdminLoggedIn()) {
      showAdminModal();
      return;
    }

    mainContent.style.display = 'none';
    adminDashboard.style.display = 'block';

    // Show verification tab by default
    showAdminTab('verification');
  }

  function showAdminTab(tab) {
    const adminContent = document.getElementById('admin-content');
    
    switch (tab) {
      case 'verification':
        adminContent.innerHTML = renderVerificationTab();
        break;
      case 'users':
        adminContent.innerHTML = renderUsersTab();
        break;
      case 'donations':
        adminContent.innerHTML = renderDonationsTab();
        break;
    }
    
    
    
    

  };
});