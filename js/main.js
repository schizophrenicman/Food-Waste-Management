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




})