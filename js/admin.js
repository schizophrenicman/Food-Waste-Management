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
}
