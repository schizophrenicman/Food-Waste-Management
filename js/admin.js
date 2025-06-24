// Admin functionality for FoodShare platform
class AdminManager {
  constructor(storage, auth) {
    this.storage = storage;
    this.auth = auth;
  }

  // Get all pending verifications
  getPendingVerifications() {
    return this.storage.getPendingVerifications().filter(v => v.status === 'pending');
  }

  // Get all verifications (including processed ones)
  getAllVerifications() {
    return this.storage.getPendingVerifications();
  }

  // Approve verification
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

  // Get all claims
  getAllClaims() {
    return this.storage.getClaims();
  }

  // Get system statistics
  getSystemStats() {
    const stats = this.storage.getStats();
    const donations = this.getAllDonations();
    const claims = this.getAllClaims();
    
    // Calculate additional metrics
    const availableDonations = donations.filter(d => d.status === 'available').length;
    const claimedDonations = donations.filter(d => d.status === 'claimed').length;
    
    return {
      ...stats,
      availableDonations,
      claimedDonations,
      claimRate: donations.length > 0 ? ((claimedDonations / donations.length) * 100).toFixed(1) : 0
    };
  }

  // Delete user (admin function)
  async deleteUser(userEmail) {
    try {
      const users = this.storage.getUsers();
      const userIndex = users.findIndex(user => user.email === userEmail);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Remove user
      users.splice(userIndex, 1);
      localStorage.setItem('users', JSON.stringify(users));

      // Remove related verifications
      const verifications = this.storage.getPendingVerifications();
      const updatedVerifications = verifications.filter(v => v.userEmail !== userEmail);
      localStorage.setItem('pendingVerifications', JSON.stringify(updatedVerifications));

      return {
        success: true,
        message: 'User deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Toggle user verification status
  async toggleUserVerification(userEmail) {
    try {
      const user = this.storage.getUserByEmail(userEmail);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = this.storage.updateUser(userEmail, { verified: !user.verified });
      
      return {
        success: true,
        message: `User ${updatedUser.verified ? 'verified' : 'unverified'} successfully`,
        user: updatedUser
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get verification details including document
  getVerificationDetails(verificationId) {
    const verifications = this.storage.getPendingVerifications();
    return verifications.find(v => v.id === verificationId);
  }

  // Search users
  searchUsers(query) {
    const users = this.getAllUsers();
    if (!query) return users;
    
    query = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.type.toLowerCase().includes(query)
    );
  }

  // Search donations
  searchDonations(query) {
    const donations = this.getAllDonations();
    if (!query) return donations;
    
    query = query.toLowerCase();
    return donations.filter(donation => 
      donation.foodName.toLowerCase().includes(query) ||
      donation.donorEmail.toLowerCase().includes(query) ||
      donation.status.toLowerCase().includes(query)
    );
  }
}

// Export for use in other files
window.AdminManager = AdminManager;