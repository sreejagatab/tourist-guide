const mongoose = require('mongoose');

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

// Generate ticket code before saving
bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate a random ticket code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ticketCode = '';
    for (let i = 0; i < 8; i++) {
      ticketCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.ticketCode = ticketCode;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
