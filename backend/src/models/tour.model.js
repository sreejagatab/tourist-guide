const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['walking', 'bus', 'bike'],
      default: 'walking'
    },
    duration: {
      type: Number,
      required: true,
      min: 1 // Duration in minutes
    },
    distance: {
      type: Number,
      required: true,
      min: 0 // Distance in kilometers
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'moderate', 'difficult'],
      default: 'moderate'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'USD'
    },
    images: [{
      type: String
    }],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          required: true
        },
        address: String,
        description: String,
        day: Number
      }
    ],
    // For bus tours
    busStops: [
      {
        location: {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: {
            type: [Number]
          },
          address: String,
          description: String
        },
        arrivalTime: String,
        departureTime: String
      }
    ],
    // For bike tours
    bikeRental: {
      available: {
        type: Boolean,
        default: false
      },
      price: {
        type: Number,
        min: 0
      },
      options: [String] // e.g., 'mountain bike', 'city bike', 'electric bike'
    },
    // For walking tours
    audioGuide: {
      available: {
        type: Boolean,
        default: false
      },
      languages: [String]
    },
    maxGroupSize: {
      type: Number,
      required: true,
      default: 15
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
      set: val => Math.round(val * 10) / 10 // Round to 1 decimal place
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for geospatial queries
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ price: 1, ratingsAverage: -1 });

// Virtual populate for reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
