const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required' });
  }
};

// Middleware to check if user is guide
exports.isGuide = (req, res, next) => {
  if (req.user && (req.user.role === 'guide' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Guide role required' });
  }
};

// Middleware to check if user is the owner of a resource or an admin
exports.isOwnerOrAdmin = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      // Check if user is the owner or an admin
      if (
        (resource.user && resource.user.toString() === req.user._id.toString()) ||
        (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) ||
        req.user.role === 'admin'
      ) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied. Not authorized' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};
