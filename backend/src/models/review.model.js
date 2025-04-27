const mongoose = require('mongoose');
// Import Tour model
const Tour = require('./tour.model');

const reviewSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    valueRating: {
      type: Number,
      min: 1,
      max: 5
    },
    experienceRating: {
      type: Number,
      min: 1,
      max: 5
    },
    guideRating: {
      type: Number,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    review: {
      type: String,
      required: true
    },
    photos: [{
      type: String
    }],
    videos: [{
      type: String
    }],
    verifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    response: {
      text: String,
      date: Date,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews from the same user for the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Static method to calculate average ratings
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

// Call calcAverageRatings before findOneAndUpdate/Delete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  if (this.r) await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
