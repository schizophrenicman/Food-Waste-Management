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
}