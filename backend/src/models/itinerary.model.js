const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    description: {
      type: String
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    days: [
      {
        date: {
          type: Date,
          required: true
        },
        activities: [
          {
            type: {
              type: String,
              enum: ['tour', 'custom', 'restaurant', 'hotel', 'transport'],
              required: true
            },
            title: {
              type: String,
              required: true
            },
            description: String,
            startTime: String,
            endTime: String,
            location: {
              type: {
                type: String,
                default: 'Point',
                enum: ['Point']
              },
              coordinates: {
                type: [Number]
              },
              address: String
            },
            tour: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Tour'
            },
            booking: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Booking'
            },
            notes: String,
            cost: Number,
            currency: {
              type: String,
              default: 'USD'
            }
          }
        ],
        notes: String,
        totalDistance: Number, // in kilometers
        estimatedTime: Number // in minutes
      }
    ],
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    totalCost: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  {
    timestamps: true
  }
);

// Index for geospatial queries on activity locations
itinerarySchema.index({ 'days.activities.location': '2dsphere' });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
