// Storage management for FoodShare platform
class StorageManager {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    // Initialize default admin account
    if (!localStorage.getItem('admin')) {
      const adminData = {
        email: 'admin@gmail.com',
        password: 'Admin@123', 
        name: 'System Administrator'
      };
      localStorage.setItem('admin', JSON.stringify(adminData));
    }

    // Initialize empty arrays if they don't exist
    const keys = ['users', 'donations', 'claims', 'reviews', 'pendingVerifications'];
    keys.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  }
}