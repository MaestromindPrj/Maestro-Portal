import express from 'express';
import {
  requestOtp,
  login,
  resetPassword,
  requestResetOtp
} from '../controllers/authController.js';

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/auth/requestResetOtp', requestResetOtp); // ✅ Fixed

export default router;
