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
  // User management
  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  }

  updateUser(email, updates) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      return users[userIndex];
    }
    return null;
  }
  // Claims management
  saveClaim(claim) {
    const claims = this.getClaims();
    claim.id = Date.now().toString();
    claim.claimedAt = new Date().toISOString();
    claims.push(claim);
    localStorage.setItem('claims', JSON.stringify(claims));
    return claim;
  }

  getClaims() {
    return JSON.parse(localStorage.getItem('claims') || '[]');
  }

  getClaimsByUser(userEmail) {
    const claims = this.getClaims();
    return claims.filter(claim => claim.receiverEmail === userEmail);
  }

  getClaimsByDonor(donorEmail) {
    const claims = this.getClaims();
    return claims.filter(claim => claim.donorEmail === donorEmail);
  }

  // Reviews management
  saveReview(review) {
    const reviews = this.getReviews();
    review.id = Date.now().toString();
    review.createdAt = new Date().toISOString();
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    return review;
  }

  getReviews() {
    return JSON.parse(localStorage.getItem('reviews') || '[]');
  }

  getReviewsByDonor(donorEmail) {
    const reviews = this.getReviews();
    return reviews.filter(review => review.donorEmail === donorEmail);
  }


}