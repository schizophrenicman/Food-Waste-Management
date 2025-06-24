
document.addEventListener('DOMContentLoaded', function() {
  
  const storage = new StorageManager();
  const auth = new AuthManager(storage);
  const admin = new AdminManager(storage, auth);
  const dashboard = new DashboardManager(storage, auth);
  const reviews = new ReviewManager(storage, auth);

  
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const adminModal = document.getElementById('admin-modal');
  const userDashboard = document.getElementById('user-dashboard');
  const adminDashboard = document.getElementById('admin-dashboard');
  const mainContent = document.getElementById('main-content');
  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');

  
  const navLinks = document.querySelectorAll('.nav-link');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  
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

    //  buttons
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

   
    document.getElementById('login-close').addEventListener('click', () => {
      loginModal.style.display = 'none';
    });

    document.getElementById('register-close').addEventListener('click', () => {
      registerModal.style.display = 'none';
    });

    document.getElementById('admin-close').addEventListener('click', () => {
      adminModal.style.display = 'none';
    });

    //  close buttons
    document.getElementById('close-dashboard').addEventListener('click', () => {
      userDashboard.style.display = 'none';
      mainContent.style.display = 'block';
    });

    document.getElementById('close-admin-dashboard').addEventListener('click', () => {
      adminDashboard.style.display = 'none';
      mainContent.style.display = 'block';
    });

   
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('admin-form').addEventListener('submit', handleAdminLogin);

    
    document.getElementById('donor-type').addEventListener('click', () => {
      selectRegisterType('donor');
    });

    document.getElementById('receiver-type').addEventListener('click', () => {
      selectRegisterType('receiver');
    });

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

   
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
           
            navMenu.classList.remove('active');
          }
        }
      });
    });

   
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        const tab = e.target.dataset.tab;
        showAdminTab(tab);
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
      }
    });

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
    
    const modalContent = registerModal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
    document.getElementById('register-form').reset();
    if (type) {
      selectRegisterType(type);
    } else {
      selectRegisterType('donor'); 
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

    
    setupDashboardEventListeners();
  }

  function setupDashboardEventListeners() {
    
    const addDonationBtn = document.getElementById('add-donation-btn');
    if (addDonationBtn) {
      addDonationBtn.addEventListener('click', () => {
        document.getElementById('add-donation-modal').style.display = 'block';
      });
    }

    
    const addDonationClose = document.getElementById('add-donation-close');
    if (addDonationClose) {
      addDonationClose.addEventListener('click', () => {
        document.getElementById('add-donation-modal').style.display = 'none';
      });
    }

   
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
          showUserDashboard(); 
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
     setupAdminEventListeners();
  }

  function renderVerificationTab() {
    const pending = admin.getPendingVerifications();
    
    return `
      <div class="admin-section">
        <h3>Pending Verifications (${pending.length})</h3>
        <div class="verification-list">
          ${pending.map(verification => `
            <div class="card">
              <div class="card-header">
                <div class="card-title">${verification.userName}</div>
                <div class="card-date">${new Date(verification.submittedAt).toLocaleDateString()}</div>
              </div>
              <p><strong>Email:</strong> ${verification.userEmail}</p>
              <p><strong>Type:</strong> ${verification.userType}</p>
              ${verification.documentData ? `
                <div class="document-section">
                  <p><strong>Document:</strong> ${verification.documentData.name}</p>
                  ${verification.documentData.type.startsWith('image/') ? `
                    <img src="${verification.documentData.data}" alt="Verification document" class="document-preview">
                  ` : `
                    <p>Document type: ${verification.documentData.type}</p>
                  `}
                </div>
              ` : ''}
              <div class="card-actions">
                <button class="btn btn-success" onclick="approveVerification('${verification.id}')">
                  Approve
                </button>
                <button class="btn btn-danger" onclick="rejectVerification('${verification.id}')">
                  Reject
                </button>
              </div>
            </div>
          `).join('')}
          ${pending.length === 0 ? '<p class="empty-state">No pending verifications.</p>' : ''}
        </div>
      </div>
    `;
  }

  function renderUsersTab() {
    const users = admin.getAllUsers();
    const stats = admin.getSystemStats();
    
    return `
      <div class="admin-section">
        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-number">${stats.totalUsers}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.verifiedReceivers}</div>
            <div class="stat-label">Verified Receivers</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${users.filter(u => u.type === 'donor').length}</div>
            <div class="stat-label">Donors</div>
          </div>
        </div>
        
        <h3>All Users (${users.length})</h3>
        <div class="users-list">
          ${users.map(user => `
            <div class="card">
              <div class="card-header">
                <div class="card-title">${user.name}</div>
                <div class="user-type ${user.type}">${user.type}</div>
              </div>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone:</strong> ${user.phone}</p>
              <p><strong>Status:</strong> 
                <span class="status ${user.verified ? 'verified' : 'unverified'}">
                  ${user.verified ? 'Verified' : 'Unverified'}
                </span>
              </p>
              <p><strong>Registered:</strong> ${new Date(user.registeredAt).toLocaleDateString()}</p>
              <div class="card-actions">
                <button class="btn ${user.verified ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleUserVerification('${user.email}')">
                  ${user.verified ? 'Unverify' : 'Verify'}
                </button>
                <button class="btn btn-danger" onclick="deleteUser('${user.email}')">
                  Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderDonationsTab() {
    const donations = admin.getAllDonations();
    const stats = admin.getSystemStats();
    
    return `
      <div class="admin-section">
        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-number">${stats.totalDonations}</div>
            <div class="stat-label">Total Donations</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.availableDonations}</div>
            <div class="stat-label">Available</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.claimedDonations}</div>
            <div class="stat-label">Claimed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.claimRate}%</div>
            <div class="stat-label">Claim Rate</div>
          </div>
        </div>
        
        <h3>All Donations (${donations.length})</h3>
        <div class="food-grid">
          ${donations.map(donation => `
            <div class="food-item">
              <div class="food-header">
                <div class="food-title">${donation.foodName}</div>
                <div class="food-status status-${donation.status}">${donation.status}</div>
              </div>
              <div class="food-details">
                <p><strong>Donor:</strong> ${donation.donorName}</p>
                <p><strong>Quantity:</strong> ${donation.quantity}</p>
                <p><strong>Location:</strong> ${donation.pickupLocation}</p>
                ${donation.description ? `<p><strong>Description:</strong> ${donation.description}</p>` : ''}
              </div>
              <div class="food-meta">
                <span class="food-date">${new Date(donation.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          `).join('')}
          ${donations.length === 0 ? '<p class="empty-state">No donations yet.</p>' : ''}
        </div>
      </div>
    `;
  }
  function setupAdminEventListeners() {
  }

  function updateImpactStats() {
    const stats = storage.getStats();
    document.getElementById('total-donations').textContent = stats.totalDonations;
    document.getElementById('total-users').textContent = stats.totalUsers;
    document.getElementById('food-saved').textContent = Math.round(stats.totalDonations * 2.5); 
  }

  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
   
    document.body.insertBefore(alert, document.body.firstChild);
    
   
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }

  window.approveVerification = async function(verificationId) {
    const result = await admin.approveVerification(verificationId);
    if (result.success) {
      showAlert(result.message, 'success');
      showAdminTab('verification'); 
    } else {
      showAlert(result.message, 'error');
    }
  };

  window.rejectVerification = async function(verificationId) {
    const reason = prompt('Enter reason for rejection (optional):');
    const result = await admin.rejectVerification(verificationId, reason || '');
    if (result.success) {
      showAlert(result.message, 'warning');
      showAdminTab('verification'); 
    } else {
      showAlert(result.message, 'error');
    }
  };

  window.deleteUser = async function(userEmail) {
    if (confirm('Are you sure you want to delete this user?')) {
      const result = await admin.deleteUser(userEmail);
      if (result.success) {
        showAlert(result.message, 'success');
        showAdminTab('users'); 
      } else {
        showAlert(result.message, 'error');
      }
    }
  };

  window.toggleUserVerification = async function(userEmail) {
    const result = await admin.toggleUserVerification(userEmail);
    if (result.success) {
      showAlert(result.message, 'success');
      showAdminTab('users'); 
    } else {
      showAlert(result.message, 'error');
    }
  };

  window.deleteDonation = async function(donationId) {
    if (confirm('Are you sure you want to delete this donation?')) {
      const result = await dashboard.deleteDonation(donationId);
      if (result.success) {
        showAlert(result.message, 'success');
        showUserDashboard(); 
        updateImpactStats();
      } else {
        showAlert(result.message, 'error');
      }
    }
  };

  window.claimDonation = async function(donationId) {
    const result = await dashboard.claimDonation(donationId);
    if (result.success) {
      showAlert(result.message, 'success');
      showUserDashboard(); 
      updateImpactStats();
    } else {
      showAlert(result.message, 'error');
    }
  };

  window.showReviewModal = function(donorEmail, donorName) {
    const reviewHTML = reviews.renderReviewForm(donorEmail, donorName);
    document.body.insertAdjacentHTML('beforeend', reviewHTML);
    

   
  };
});