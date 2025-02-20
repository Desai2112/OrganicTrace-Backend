import User from '../Models/User.js';

export const protect = async (req, res, next) => {
  try {
    // Check if session exists
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Please log in to access this resource' });
    }

    // Get user from session
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 