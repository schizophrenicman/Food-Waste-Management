//Dashboard functionality
class DashboardManager {
  constructor(storage, auth) {
    this.storage = storage;
    this.auth = auth;
  }

  //Create donation
  async createDonation(donationData) {
    try {
      const user = this.auth.getCurrentUser();
      if (!user || user.type !== 'donor') {
        throw new Error('Only donors can create donations');
      }

      if (!donationData.foodName || !donationData.quantity || !donationData.pickupLocation) {
        throw new Error('All fields are required');
      }

      const donation = {
        foodName: donationData.foodName,
        description: donationData.description || '',
        quantity: donationData.quantity,
        pickupLocation: donationData.pickupLocation,
        expiryDate: donationData.expiryDate,
        donorEmail: user.email,
        donorName: user.name,
        donorPhone: user.phone,
        status: 'available'
      };

      const savedDonation = this.storage.saveDonation(donation);

      return {
        success: true,
        message: 'Donation created successfully',
        donation: savedDonation
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  getAvailableDonations() {
    return this.storage.getDonations().filter(donation => donation.status === 'available');
  }

  getUserDonations() {
    const user = this.auth.getCurrentUser();
    if (!user) return [];
    
    return this.storage.getDonations().filter(donation => donation.donorEmail === user.email);
  }

  getUserClaims() {
    const user = this.auth.getCurrentUser();
    if (!user) return [];
    
    return this.storage.getClaimsByUser(user.email);
  }

  async claimDonation(donationId) {
    try {
      const user = this.auth.getCurrentUser();
      if (!user || user.type !== 'receiver') {
        throw new Error('Only receivers can claim donations');
      }

      if (!user.verified) {
        throw new Error('Your account must be verified to claim donations');
      }

      const donation = this.storage.getDonationById(donationId);
      if (!donation) {
        throw new Error('Donation not found');
      }

      if (donation.status !== 'available') {
        throw new Error('This donation is no longer available');
      }
      
      this.storage.updateDonation(donationId, { 
        status: 'claimed',
        claimedBy: user.email,
        claimedAt: new Date().toISOString()
      });
    
      const claim = {
        donationId: donationId,
        receiverEmail: user.email,
        receiverName: user.name,
        receiverPhone: user.phone,
        donorEmail: donation.donorEmail,
        donorName: donation.donorName,
        foodName: donation.foodName,
        quantity: donation.quantity,
        pickupLocation: donation.pickupLocation
      };   
      
      const savedClaim = this.storage.saveClaim(claim);

      return {
        success: true,
        message: 'Donation claimed successfully! Contact the donor to arrange pickup.',
        claim: savedClaim
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

    async updateDonationStatus(donationId, status) {
      try {
        const user = this.auth.getCurrentUser();
        if (!user) {
          throw new Error('User not logged in');
        }

        const donation = this.storage.getDonationById(donationId);
        if (!donation) {
          throw new Error('Donation not found');
        }

        if (donation.donorEmail !== user.email) {
          throw new Error('You can only update your own donations');
        }

        const updatedDonation = this.storage.updateDonation(donationId, { status });

        return {
          success: true,
          message: 'Donation status updated successfully',
          donation: updatedDonation
        };

      } catch (error) {
        return {
          success: false,
          message: error.message
        };
    }
  }

  async deleteDonation(donationId) {
    try {
      const user = this.auth.getCurrentUser();
      if (!user) {
        throw new Error('User not logged in');
      }

      const donation = this.storage.getDonationById(donationId);
      if (!donation) {
        throw new Error('Donation not found');
      }

      if (donation.donorEmail !== user.email) {
        throw new Error('You can only delete your own donations');
      }

      if (donation.status === 'claimed') {
        throw new Error('Cannot delete claimed donations');
      }

      const donations = this.storage.getDonations();
      const updatedDonations = donations.filter(d => d.id !== donationId);
      localStorage.setItem('donations', JSON.stringify(updatedDonations));

      return {
        success: true,
        message: 'Donation deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

}