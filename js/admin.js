class AdminManager {
  constructor(storage, auth) {
    this.storage = storage;
    this.auth = auth;
  }


  getPendingVerifications() {
    return this.storage.getPendingVerifications().filter(v => v.status === 'pending');
  }

  
  getAllVerifications() {
    return this.storage.getPendingVerifications();
  }

  //Approve verisfication
    async approveVerification(verificationId, adminNotes = '') {
    try {
      const verification = this.storage.updateVerificationStatus(verificationId, 'approved', adminNotes);
      if (!verification) {
        throw new Error('Verification not found');
      }

      return {
        success: true,
        message: 'User verification approved successfully',
        verification: verification
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Reject verification
  async rejectVerification(verificationId, adminNotes = '') {
    try {
      const verification = this.storage.updateVerificationStatus(verificationId, 'rejected', adminNotes);
      if (!verification) {
        throw new Error('Verification not found');
      }

      return {
        success: true,
        message: 'User verification rejected',
        verification: verification
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get all users with their status
  getAllUsers() {
    const users = this.storage.getUsers();
    const verifications = this.storage.getPendingVerifications();
    
    return users.map(user => {
      const verification = verifications.find(v => v.userEmail === user.email);
      return {
        ...user,
        verificationStatus: verification ? verification.status : (user.verified ? 'approved' : 'none'),
        verificationDate: verification ? verification.reviewedAt : null
      };
    });
  }

  // Get all donations
  getAllDonations() {
    return this.storage.getDonations();
  }

  //Claims
  getAllClaims() {
    return this.storage.getClaims();
  }

  //Statistics
  getSystemStats() {
    const stats = this.storage.getStats();
    const donations = this.getAllDonations();
    const claims = this.getAllClaims();
    
    const availableDonations = donations.filter(d => d.status === 'available').length;
    const claimedDonations = donations.filter(d => d.status === 'claimed').length;
        return {
      ...stats,
      availableDonations,
      claimedDonations,
      claimRate: donations.length > 0 ? ((claimedDonations / donations.length) * 100).toFixed(1) : 0
    };
 }

  //Delete user
  async deleteUser(userEmail) {
    try {
      const users = this.storage.getUsers();
      const userIndex = users.findIndex(user => user.email === userEmail);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
    }
  }
}
