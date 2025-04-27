const Itinerary = require('../models/itinerary.model');
const Tour = require('../models/tour.model');

// Get all itineraries for a user
exports.getUserItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get itinerary by ID
exports.getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate({
        path: 'days.activities.tour',
        select: 'name type duration price'
      })
      .populate({
        path: 'days.activities.booking',
        select: 'date numberOfPeople status'
      })
      .populate('user', 'username')
      .populate('sharedWith', 'username');
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Check if user is authorized to view this itinerary
    const isOwner = itinerary.user._id.toString() === req.user._id.toString();
    const isSharedWith = itinerary.sharedWith.some(user => user._id.toString() === req.user._id.toString());
    const isPublic = itinerary.isPublic;
    
    if (!isOwner && !isSharedWith && !isPublic && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this itinerary' });
    }
    
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new itinerary
exports.createItinerary = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      description,
      isPublic,
      days,
      sharedWith
    } = req.body;

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Calculate total cost
    let totalCost = 0;
    if (days && days.length > 0) {
      days.forEach(day => {
        if (day.activities && day.activities.length > 0) {
          day.activities.forEach(activity => {
            if (activity.cost) {
              totalCost += activity.cost;
            }
          });
        }
      });
    }

    // Create new itinerary
    const itinerary = new Itinerary({
      name,
      user: req.user._id,
      startDate,
      endDate,
      description,
      isPublic: isPublic || false,
      days,
      sharedWith,
      totalCost
    });

    const savedItinerary = await itinerary.save();
    
    res.status(201).json(savedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an itinerary
exports.updateItinerary = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      description,
      isPublic,
      days,
      sharedWith
    } = req.body;

    // Check if itinerary exists
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if user is the owner
    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this itinerary' });
    }

    // Validate dates if provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Calculate total cost if days are provided
    let totalCost = itinerary.totalCost;
    if (days && days.length > 0) {
      totalCost = 0;
      days.forEach(day => {
        if (day.activities && day.activities.length > 0) {
          day.activities.forEach(activity => {
            if (activity.cost) {
              totalCost += activity.cost;
            }
          });
        }
      });
    }

    // Update itinerary
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      {
        name: name || itinerary.name,
        startDate: startDate || itinerary.startDate,
        endDate: endDate || itinerary.endDate,
        description: description !== undefined ? description : itinerary.description,
        isPublic: isPublic !== undefined ? isPublic : itinerary.isPublic,
        days: days || itinerary.days,
        sharedWith: sharedWith || itinerary.sharedWith,
        totalCost
      },
      { new: true, runValidators: true }
    );

    res.json(updatedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an itinerary
exports.deleteItinerary = async (req, res) => {
  try {
    // Check if itinerary exists
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if user is the owner or admin
    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this itinerary' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a tour to an itinerary
exports.addTourToItinerary = async (req, res) => {
  try {
    const { tourId, dayIndex, startTime, endTime, notes } = req.body;
    
    if (dayIndex === undefined) {
      return res.status(400).json({ message: 'Day index is required' });
    }

    // Check if itinerary exists
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if user is the owner
    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this itinerary' });
    }

    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if day exists in itinerary
    if (!itinerary.days[dayIndex]) {
      return res.status(404).json({ message: 'Day not found in itinerary' });
    }

    // Create activity object
    const activity = {
      type: 'tour',
      title: tour.name,
      description: tour.description,
      startTime,
      endTime,
      location: tour.startLocation,
      tour: tourId,
      notes,
      cost: tour.price
    };

    // Add activity to day
    itinerary.days[dayIndex].activities.push(activity);
    
    // Update total cost
    itinerary.totalCost += tour.price;

    const updatedItinerary = await itinerary.save();
    
    res.json(updatedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get public itineraries
exports.getPublicItineraries = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get public itineraries
    const itineraries = await Itinerary.find({ isPublic: true })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Itinerary.countDocuments({ isPublic: true });
    
    res.json({
      itineraries,
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

// Share itinerary with a user
exports.shareItinerary = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if itinerary exists
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if user is the owner
    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to share this itinerary' });
    }

    // Check if already shared with this user
    if (itinerary.sharedWith.includes(userId)) {
      return res.status(400).json({ message: 'Itinerary already shared with this user' });
    }

    // Add user to sharedWith array
    itinerary.sharedWith.push(userId);
    const updatedItinerary = await itinerary.save();
    
    res.json(updatedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
