const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

const checkRole = (roles) => {
  return (req, res, next) => {
    // Standardize to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    // Convert to lowercase to match model
    const normalizedRoles = allowedRoles.map(r => r.toLowerCase());
    
    if (!normalizedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};

const authorize = (...roles) => {
  // Flatten in case an array was passed as first arg
  const flatRoles = roles.flat();
  return checkRole(flatRoles);
};

module.exports = { protect, checkRole, authorize };
