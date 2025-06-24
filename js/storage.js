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

   

  
  saveDonation(donation) {
    const donations = this.getDonations();
    donation.id = Date.now().toString();
    donation.createdAt = new Date().toISOString();
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
    return donation;
  }

  getDonations() {
    return JSON.parse(localStorage.getItem('donations') || '[]');
  }

  getDonationById(id) {
    const donations = this.getDonations();
    return donations.find(donation => donation.id === id);
  }

  updateDonation(id, updates) {
    const donations = this.getDonations();
    const donationIndex = donations.findIndex(donation => donation.id === id);
    if (donationIndex !== -1) {
      donations[donationIndex] = { ...donations[donationIndex], ...updates };
      localStorage.setItem('donations', JSON.stringify(donations));
      return donations[donationIndex];
    }
    return null;
  }

  
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

  
  savePendingVerification(verification) {
    const pending = this.getPendingVerifications();
    verification.id = Date.now().toString();
    verification.submittedAt = new Date().toISOString();
    verification.status = 'pending';
    pending.push(verification);
    localStorage.setItem('pendingVerifications', JSON.stringify(pending));
    return verification;
  }

  getPendingVerifications() {
    return JSON.parse(localStorage.getItem('pendingVerifications') || '[]');
  }

  updateVerificationStatus(id, status, adminNotes = '') {
    const pending = this.getPendingVerifications();
    const verificationIndex = pending.findIndex(v => v.id === id);
    if (verificationIndex !== -1) {
      pending[verificationIndex].status = status;
      pending[verificationIndex].adminNotes = adminNotes;
      pending[verificationIndex].reviewedAt = new Date().toISOString();
      localStorage.setItem('pendingVerifications', JSON.stringify(pending));
      
      
      if (status === 'approved') {
        const userEmail = pending[verificationIndex].userEmail;
        this.updateUser(userEmail, { verified: true });
      }
      
      return pending[verificationIndex];
    }
    return null;
  }

  
  getAdmin() {
    return JSON.parse(localStorage.getItem('admin'));
  }

  
  getStats() {
    const users = this.getUsers();
    const donations = this.getDonations();
    const claims = this.getClaims();
    
    return {
      totalUsers: users.length,
      totalDonations: donations.length,
      totalClaims: claims.length,
      verifiedReceivers: users.filter(u => u.type === 'receiver' && u.verified).length,
      pendingVerifications: this.getPendingVerifications().filter(v => v.status === 'pending').length
    };
  }

  
  getTopDonor() {
    const users = this.getUsers();
    const reviews = this.getReviews();
    const donations = this.getDonations();
    
    const donors = users.filter(user => user.type === 'donor');
    
    let topDonor = null;
    let bestScore = 0;
    
    donors.forEach(donor => {
      const donorReviews = reviews.filter(review => review.donorEmail === donor.email);
      const donorDonations = donations.filter(donation => donation.donorEmail === donor.email);
      
      if (donorReviews.length > 0) {
        const averageRating = donorReviews.reduce((sum, review) => sum + review.rating, 0) / donorReviews.length;
        const score = averageRating * donorReviews.length; 
        
        if (score > bestScore) {
          bestScore = score;
          topDonor = {
            ...donor,
            averageRating,
            totalReviews: donorReviews.length,
            totalDonations: donorDonations.length
          };
        }
      }
    });
    
    return topDonor;
  }

  // Clear all data (for testing purposes)
  clearAllData() {
    const keys = ['users', 'donations', 'claims', 'reviews', 'pendingVerifications'];
    keys.forEach(key => localStorage.removeItem(key));
    this.initializeStorage();
  }
}

// Export for use in other files
window.StorageManager = StorageManager;