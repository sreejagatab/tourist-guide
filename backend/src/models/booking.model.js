const mongoose = require('mongoose');
const encryption = require('../utils/encryption');

const bookingSchema = new mongoose.Schema(
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
    price: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    paymentId: {
      type: String
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe'],
      required: true
    },
    // Encrypted payment details
    paymentDetails: {
      type: String,
      default: null
    },
    ticketCode: {
      type: String
    },
    specialRequests: {
      type: String
    },
    // For bike tours
    bikeRentalDetails: {
      rented: {
        type: Boolean,
        default: false
      },
      bikeType: String,
      quantity: Number,
      rentalPrice: Number
    }
  },
  {
    timestamps: true
  }
);

// Generate ticket code and encrypt payment details before saving
bookingSchema.pre('save', function(next) {
  try {
    if (this.isNew) {
      // Generate a random ticket code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let ticketCode = '';
      for (let i = 0; i < 8; i++) {
        ticketCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      this.ticketCode = ticketCode;
    }

    // Encrypt payment details if modified
    if (this.isModified('paymentDetails') && this.paymentDetails) {
      this.paymentDetails = encryption.encrypt(this.paymentDetails);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to get decrypted payment details
bookingSchema.methods.getDecryptedPaymentDetails = function() {
  if (!this.paymentDetails) return null;
  return encryption.decrypt(this.paymentDetails, true);
};

// Transform the document when converting to JSON
bookingSchema.methods.toJSON = function() {
  const booking = this.toObject();

  // Remove sensitive information from the JSON output
  delete booking.paymentDetails;

  return booking;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
