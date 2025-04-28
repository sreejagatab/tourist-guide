const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['pageview', 'event', 'error', 'batch']
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sessionId: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for common queries
analyticsEventSchema.index({ type: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: -1 });

// Add TTL index to automatically delete old events after 90 days
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;
