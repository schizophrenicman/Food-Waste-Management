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

  getDonorClaims() {
    const user = this.auth.getCurrentUser();
    if (!user || user.type !== 'donor') return [];
    
    return this.storage.getClaimsByDonor(user.email);
  }

  generateDashboardContent() {
    const user = this.auth.getCurrentUser();
    if (!user) return '';

    if (user.type === 'donor') {
      return this.generateDonorDashboard();
    } else if (user.type === 'receiver') {
      return this.generateReceiverDashboard();
    }
  }

  generateDonorDashboard() {
    const user = this.auth.getCurrentUser();
    const donations = this.getUserDonations();
    const claims = this.getDonorClaims();

    return `
      <div class="dashboard-welcome">
        <h3>Welcome back, ${user.name}! 👋</h3>
        <p>Thank you for helping reduce food waste in our community.</p>
      </div>

      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-number">${donations.length}</div>
          <div class="stat-label">Total Donations</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${claims.length}</div>
          <div class="stat-label">Items Claimed</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${donations.filter(d => d.status === 'available').length}</div>
          <div class="stat-label">Available Items</div>
        </div>
      </div>

      <div class="dashboard-actions">
        <button class="btn btn-primary" id="add-donation-btn">
          ➕ Add New Donation
        </button>
      </div>

      <div class="dashboard-section">
        <h4>Your Donations</h4>
        <div id="user-donations" class="food-grid">
          ${this.renderDonations(donations)}
        </div>
      </div>

      <div class="dashboard-section">
        <h4>Recent Claims</h4>
        <div id="recent-claims">
          ${this.renderClaims(claims)}
        </div>
      </div>

      <!-- Add Donation Modal -->
      <div id="add-donation-modal" class="modal">
        <div class="modal-content">
          <span class="close" id="add-donation-close">&times;</span>
          <h3>Add New Donation</h3>
          <form id="add-donation-form">
            <div class="form-group">
              <label for="food-name">Food Name:</label>
              <input type="text" id="food-name" required>
            </div>
            <div class="form-group">
              <label for="food-description">Description:</label>
              <textarea id="food-description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="food-quantity">Quantity:</label>
              <input type="text" id="food-quantity" placeholder="e.g., 5 portions, 2 bags" required>
            </div>
            <div class="form-group">
              <label for="pickup-location">Pickup Location:</label>
              <input type="text" id="pickup-location" required>
            </div>
            <div class="form-group">
              <label for="expiry-date">Expiry Date (optional):</label>
              <input type="date" id="expiry-date">
            </div>
            <button type="submit" class="btn btn-primary">Add Donation</button>
          </form>
        </div>
      </div>
    `;
  }

  generateReceiverDashboard() {
    const user = this.auth.getCurrentUser();
    const claims = this.getUserClaims();
    const availableDonations = this.getAvailableDonations();

    if (!user.verified) {
      return `
        <div class="dashboard-welcome">
          <h3>Welcome, ${user.name}! 👋</h3>
          <div class="alert alert-warning">
            <strong>Account Pending Verification</strong><br>
            Your account is currently under review. You'll be able to claim food donations once verified by our admin team.
          </div>
        </div>
      `;
    }

    return `
      <div class="dashboard-welcome">
        <h3>Welcome back, ${user.name}! 👋</h3>
        <p>Find available food donations in your community.</p>
      </div>

      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-number">${availableDonations.length}</div>
          <div class="stat-label">Available Donations</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${claims.length}</div>
          <div class="stat-label">Your Claims</div>
        </div>
      </div>

      <div class="dashboard-section">
        <h4>Available Food Donations</h4>
        <div id="available-donations" class="food-grid">
          ${this.renderAvailableDonations(availableDonations)}
        </div>
      </div>

      <div class="dashboard-section">
        <h4>Your Claims</h4>
        <div id="user-claims">
          ${this.renderUserClaims(claims)}
        </div>
      </div>
    `;
  }

  renderDonations(donations) {
    if (donations.length === 0) {
      return '<p class="empty-state">No donations yet. Click "Add New Donation" to get started!</p>';
    }

    return donations.map(donation => `
      <div class="food-item">
        <div class="food-header">
          <div class="food-title">${donation.foodName}</div>
          <div class="food-status status-${donation.status}">${donation.status}</div>
        </div>
        <div class="food-details">
          <p><strong>Quantity:</strong> ${donation.quantity}</p>
          <p><strong>Location:</strong> ${donation.pickupLocation}</p>
          ${donation.description ? `<p><strong>Description:</strong> ${donation.description}</p>` : ''}
          ${donation.expiryDate ? `<p><strong>Expires:</strong> ${new Date(donation.expiryDate).toLocaleDateString()}</p>` : ''}
        </div>
        <div class="food-meta">
          <span class="food-date">Posted ${new Date(donation.createdAt).toLocaleDateString()}</span>
          <div class="food-actions">
            ${donation.status === 'available' ? `
              <button class="btn btn-danger btn-small" onclick="deleteDonation('${donation.id}')">Delete</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

}