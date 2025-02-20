import User from '../Models/User.js';

export const register = async (req, res) => {
  try {
    const { email, password, name, role, company } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role,
      company,
    });

    // Start session and store user data
    req.session.userId = user._id;

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error in registration',
      error: error.message,
      success: false
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Start session and store user data
    req.session.userId = user._id;

    res.json({
      message: 'Login successful',
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error in login',
      error: error.message,
      success: false
    });
  }
};

export const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ message: 'Logged out successfully',
      success: true 
       });
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error in logout',
      error: error.message,
      success: false
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'Profile retrieved successfully',
      data: user,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message,
      success: false
    });
  }
}; 