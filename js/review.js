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
    }
}
}