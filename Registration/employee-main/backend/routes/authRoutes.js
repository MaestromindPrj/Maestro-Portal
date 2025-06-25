import express from 'express';
import {
  sendOtp,
  register,
  login,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);

export default router;
