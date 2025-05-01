import express from 'express';
import {
    register,
    verifyOTP,
    login,
    logout,
    getProfile,
    getAllDistributor
} from '../controllers/auth.controller.js';
// import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/verify', verifyOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.get('/distributor', getAllDistributor);

export default router; 