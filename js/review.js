class ReviewManager {
  constructor(storage, auth) {
    this.storage = storage;
    this.auth = auth;
  }

  //Review submission
  async submitReview(donorEmail, rating, comment = '') {
    try {
      const user = this.auth.getCurrentUser();
      if (!user) {
        throw new Error('User must be logged in to submit reviews');
      }

      if (user.type !== 'receiver') {
        throw new Error('Only receivers can submit reviews');
      }

      if (!donorEmail || !rating) {
        throw new Error('Donor email and rating are required');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
     
    //if donor has already reviewed or not
      const existingReviews = this.storage.getReviews();
      const hasReviewed = existingReviews.some(review => 
        review.reviewerEmail === user.email && review.donorEmail === donorEmail
      );

      if (hasReviewed) {
        throw new Error('You have already reviewed this donor');
      }
      const review = {
        donorEmail: donorEmail,
        reviewerEmail: user.email,
        reviewerName: user.name,
        rating: parseInt(rating),
        comment: comment.trim(),
      };

      const savedReview = this.storage.saveReview(review);

      return {
        success: true,
        message: 'Review submitted successfully',
        review: savedReview
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  getDonorReviews(donorEmail) {
    return this.storage.getReviewsByDonor(donorEmail);
  }

  getDonorAverageRating(donorEmail) {
    const reviews = this.getDonorReviews(donorEmail);
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  }

  getTopDonor() {
    return this.storage.getTopDonor();
  }

  updateTopDonorDisplay() {
    const topDonor = this.getTopDonor();
    const topDonorName = document.getElementById('top-donor-name');
    const topDonorDonations = document.getElementById('top-donor-donations');
    const topDonorRating = document.getElementById('top-donor-rating');

    if (topDonor) {
      topDonorName.textContent = topDonor.name;
      topDonorDonations.textContent = `${topDonor.totalDonations} donations`;
      topDonorRating.textContent = `⭐ ${topDonor.averageRating.toFixed(1)} (${topDonor.totalReviews} reviews)`;
    } else {
      topDonorName.textContent = 'No donors yet';
      topDonorDonations.textContent = '0 donations';
      topDonorRating.textContent = '⭐ 0.0';
    }
  }

  //Rendering review form
  renderReviewForm(donorEmail, donorName) {
    return `
      <div id="review-modal" class="modal" style="display: block;">
        <div class="modal-content">
          <span class="close" id="review-close">&times;</span>
          <h3>Review ${donorName}</h3>
          <form id="review-form">
            <input type="hidden" id="review-donor-email" value="${donorEmail}">
            <div class="form-group">
              <label>Rating:</label>
              <div class="rating" id="rating-stars">
                <span class="star" data-rating="1">⭐</span>
                <span class="star" data-rating="2">⭐</span>
                <span class="star" data-rating="3">⭐</span>
                <span class="star" data-rating="4">⭐</span>
                <span class="star" data-rating="5">⭐</span>
              </div>
              <input type="hidden" id="review-rating" required>
            </div>
            <div class="form-group">
              <label for="review-comment">Comment (optional):</label>
              <textarea id="review-comment" rows="4" placeholder="Share your experience..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Review</button>
          </form>
        </div>
      </div>
    `;
  }

  renderReviews(reviews) {
    if (reviews.length === 0) {
      return '<p class="empty-state">No reviews yet.</p>';
    }

    return reviews.map(review => `
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">${review.reviewerName}</span>
          <div class="rating">
            ${'⭐'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
          </div>
          <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
        ${review.comment ? `<p class="review-text">${review.comment}</p>` : ''}
      </div>
    `).join('');
  }

  //review form interactions
  initializeReviewForm() {
    
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('star')) {
        const rating = parseInt(e.target.dataset.rating);
        const stars = e.target.parentNode.querySelectorAll('.star');
        const ratingInput = document.getElementById('review-rating');
        
        
        stars.forEach((star, index) => {
          if (index < rating) {
            star.classList.add('active');
          } else {
            star.classList.remove('active');
          }
        });
        
        if (ratingInput) {
          ratingInput.value = rating;
        }
      }
    });

    document.addEventListener('submit', async (e) => {
      if (e.target.id === 'review-form') {
        e.preventDefault();
        
        const donorEmail = document.getElementById('review-donor-email').value;
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;
        
        if (!rating) {
          alert('Please select a rating');
          return;
        }

        const result = await this.submitReview(donorEmail, rating, comment);
        
        if (result.success) {
          alert(result.message);
          document.getElementById('review-modal').remove();
          this.updateTopDonorDisplay();
        } else {
          alert(result.message);
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'review-close') {
        document.getElementById('review-modal').remove();
      }
    });
  }
}

window.ReviewManager = ReviewManager;
