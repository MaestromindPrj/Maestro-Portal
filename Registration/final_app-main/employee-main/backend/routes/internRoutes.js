import express from 'express';
import multer from 'multer';
import {
  sendInternOtp,
  registerIntern,
  loginIntern,
  resetInternPassword,
} from '../controllers/internController.js';

const router = express.Router();

// === Multer Setup for file uploads ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Register route with file uploads:
router.post('/register', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 }
]), registerIntern);

// Routes
router.post('/send-otp', sendInternOtp);
router.post('/register', upload.fields([{ name: 'resume' }, { name: 'aadhar' }]), registerIntern);
router.post('/login', loginIntern);
router.post('/reset-password', resetInternPassword);

export default router;
