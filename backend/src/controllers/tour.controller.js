const Tour = require('../models/tour.model');

// Get all tours
exports.getAllTours = async (req, res) => {
  try {
    const { 
      type, 
      difficulty, 
      minPrice, 
      maxPrice, 
      sort, 
      limit = 10, 
      page = 1 
    } = req.query;

    // Build query
    const query = {};
    
    // Filter by tour type
    if (type) {
      query.type = type;
    }
    
    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort options
    let sortOptions = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      // Default sort by createdAt
      sortOptions = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query
    const tours = await Tour.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'username');
    
    // Get total count for pagination
    const total = await Tour.countDocuments(query);
    
    res.json({
      tours,
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

// Get tour by ID
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'username profilePicture'
        }
      });
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new tour
exports.createTour = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      duration,
      distance,
      difficulty,
      price,
      currency,
      images,
      startLocation,
      locations,
      busStops,
      bikeRental,
      audioGuide,
      maxGroupSize
    } = req.body;

    // Check if tour with same name already exists
    const existingTour = await Tour.findOne({ name });
    if (existingTour) {
      return res.status(400).json({ message: 'Tour with this name already exists' });
    }

    // Create new tour
    const tour = new Tour({
      name,
      description,
      type,
      duration,
      distance,
      difficulty,
      price,
      currency,
      images,
      startLocation,
      locations,
      busStops,
      bikeRental,
      audioGuide,
      maxGroupSize,
      createdBy: req.user._id
    });

    const savedTour = await tour.save();
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a tour
exports.updateTour = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      duration,
      distance,
      difficulty,
      price,
      currency,
      images,
      startLocation,
      locations,
      busStops,
      bikeRental,
      audioGuide,
      maxGroupSize
    } = req.body;

    // Check if tour exists
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if user is the creator or an admin
    if (tour.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tour' });
    }

    // Check if updating to a name that already exists (excluding this tour)
    if (name && name !== tour.name) {
      const existingTour = await Tour.findOne({ name, _id: { $ne: req.params.id } });
      if (existingTour) {
        return res.status(400).json({ message: 'Tour with this name already exists' });
      }
    }

    // Update tour
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      {
        name: name || tour.name,
        description: description || tour.description,
        type: type || tour.type,
        duration: duration || tour.duration,
        distance: distance || tour.distance,
        difficulty: difficulty || tour.difficulty,
        price: price || tour.price,
        currency: currency || tour.currency,
        images: images || tour.images,
        startLocation: startLocation || tour.startLocation,
        locations: locations || tour.locations,
        busStops: busStops || tour.busStops,
        bikeRental: bikeRental || tour.bikeRental,
        audioGuide: audioGuide || tour.audioGuide,
        maxGroupSize: maxGroupSize || tour.maxGroupSize
      },
      { new: true, runValidators: true }
    );

    res.json(updatedTour);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a tour
exports.deleteTour = async (req, res) => {
  try {
    // Check if tour exists
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if user is the creator or an admin
    if (tour.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tour' });
    }

    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tours by type
exports.getToursByType = async (req, res) => {
  try {
    const { type } = req.params;
    const tours = await Tour.find({ type })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search tours
exports.searchTours = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const tours = await Tour.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
