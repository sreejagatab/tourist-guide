const Booking = require('../models/booking.model');
const Tour = require('../models/tour.model');

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('tour')
      .sort({ date: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tour')
      .populate('user', 'username email firstName lastName');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to the user or user is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      tourId,
      date,
      numberOfPeople,
      paymentMethod,
      specialRequests,
      bikeRentalDetails
    } = req.body;

    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Calculate total amount
    const totalAmount = tour.price * numberOfPeople;
    
    // Add bike rental cost if applicable
    let bikeRentalCost = 0;
    if (bikeRentalDetails && bikeRentalDetails.rented && tour.type === 'bike') {
      bikeRentalCost = (tour.bikeRental.price || 0) * (bikeRentalDetails.quantity || 0);
    }

    // Create new booking
    const booking = new Booking({
      tour: tourId,
      user: req.user._id,
      price: tour.price,
      date,
      numberOfPeople,
      totalAmount: totalAmount + bikeRentalCost,
      paymentMethod,
      specialRequests,
      bikeRentalDetails
    });

    const savedBooking = await booking.save();
    
    // Populate tour details for response
    const populatedBooking = await Booking.findById(savedBooking._id).populate('tour');
    
    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Check if booking exists
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only admin can update status other than cancellation
    if (status !== 'cancelled' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update booking status' });
    }
    
    // Users can only cancel their own bookings
    if (status === 'cancelled' && 
        booking.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Update booking status
    booking.status = status;
    const updatedBooking = await booking.save();
    
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, tourId, startDate, endDate, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (tourId) {
      query.tour = tourId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query
    const bookings = await Booking.find(query)
      .populate('tour')
      .populate('user', 'username email firstName lastName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Booking.countDocuments(query);
    
    res.json({
      bookings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
