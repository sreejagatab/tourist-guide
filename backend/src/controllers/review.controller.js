const Review = require('../models/review.model');
const Tour = require('../models/tour.model');
const Booking = require('../models/booking.model');

// Get all reviews for a tour
exports.getTourReviews = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Check if tour exists
    const tourExists = await Tour.exists({ _id: tourId });
    if (!tourExists) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    const reviews = await Review.find({ tour: tourId })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reviews by a user
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('tour', 'name type')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const {
      tourId,
      rating,
      valueRating,
      experienceRating,
      guideRating,
      title,
      review,
      photos,
      videos
    } = req.body;

    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if user has already reviewed this tour
    const existingReview = await Review.findOne({
      tour: tourId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this tour' });
    }

    // Check if user has booked this tour (for verified purchase badge)
    const userBooking = await Booking.findOne({
      tour: tourId,
      user: req.user._id,
      status: 'confirmed'
    });
    
    const verifiedPurchase = !!userBooking;

    // Create new review
    const newReview = new Review({
      tour: tourId,
      user: req.user._id,
      rating,
      valueRating,
      experienceRating,
      guideRating,
      title,
      review,
      photos,
      videos,
      verifiedPurchase
    });

    const savedReview = await newReview.save();
    
    // Populate user details for response
    const populatedReview = await Review.findById(savedReview._id)
      .populate('user', 'username profilePicture');
    
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const {
      rating,
      valueRating,
      experienceRating,
      guideRating,
      title,
      review,
      photos,
      videos
    } = req.body;

    // Check if review exists
    const existingReview = await Review.findById(req.params.id);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the author of the review
    if (existingReview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update review
    existingReview.rating = rating || existingReview.rating;
    existingReview.valueRating = valueRating || existingReview.valueRating;
    existingReview.experienceRating = experienceRating || existingReview.experienceRating;
    existingReview.guideRating = guideRating || existingReview.guideRating;
    existingReview.title = title || existingReview.title;
    existingReview.review = review || existingReview.review;
    existingReview.photos = photos || existingReview.photos;
    existingReview.videos = videos || existingReview.videos;

    const updatedReview = await existingReview.save();
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    // Check if review exists
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the author of the review or an admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a response to a review (for tour operators/admins)
exports.addReviewResponse = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Response text is required' });
    }

    // Check if review exists
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is a guide or admin
    if (req.user.role !== 'guide' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to respond to reviews' });
    }

    // Add response
    review.response = {
      text,
      date: new Date(),
      user: req.user._id
    };

    const updatedReview = await review.save();
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Vote a review as helpful
exports.voteReviewHelpful = async (req, res) => {
  try {
    // Check if review exists
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Increment helpful votes
    review.helpfulVotes += 1;
    const updatedReview = await review.save();
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
