import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../firebase.js';

dotenv.config();

// In-memory OTP store
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Utility: Find user by email or mobile
const findUser = async (identifier) => {
  const query = identifier.includes('@')
    ? db.collection('admins').where('email', '==', identifier.toLowerCase())
    : db.collection('admins').where('mobile', '==', identifier);
  const snapshot = await query.limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, data: snapshot.docs[0].data() };
};

// STEP 1: Request OTP after verifying identifier + password
export const requestOtp = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password required' });
  }

  try {
    const userDoc = await findUser(identifier);
    if (!userDoc) {
      return res.status(401).json({ message: 'Invalid credentials (identifier)' });
    }

    const { id, data: user } = userDoc;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (password)' });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore[identifier] = { otp, expiresAt };

    if (user.email) {
      await transporter.sendMail({
        to: user.email,
        subject: 'Your OTP - Maestrominds',
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
      });
    }

    console.log('[OTP SENT] to:', identifier);
    return res.status(200).json({ message: 'OTP sent successfully' });

  } catch (err) {
    console.error('[REQUEST OTP ERROR]:', err);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// STEP 2: Final login with identifier + password + OTP
export const login = async (req, res) => {
  const { identifier, password, otp } = req.body;
  if (!identifier || !password || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userDoc = await findUser(identifier);
    if (!userDoc) {
      return res.status(401).json({ message: 'Invalid credentials (identifier)' });
    }

    const { id, data: user } = userDoc;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (password)' });
    }

    const storedOtp = otpStore[identifier];
    if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    delete otpStore[identifier];

    const token = jwt.sign({ id, identifier }, process.env.JWT_SECRET, { expiresIn: '1h' });

    if (user.email) {
      await transporter.sendMail({
        to: user.email,
        subject: 'Login Confirmation - Maestrominds',
        html: `
          <p>Hello <b>${user.email}</b>,</p>
          <p>You have successfully logged into the Maestrominds admin portal.</p>
          <p>If this wasn't you, please reset your password immediately.</p>
          <br/>
          <p>— Maestrominds Security Team</p>
        `,
      });
    }

    console.log('[LOGIN] Success:', identifier);
    return res.status(200).json({ success: true, token, message: 'Login successful' });

  } catch (err) {
    console.error('[LOGIN ERROR]:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

// RESET STEP 1: Send OTP for password reset
export const requestResetOtp = async (req, res) => {
  const { identifier, newPassword } = req.body;
  if (!identifier || !newPassword) {
    return res.status(400).json({ message: 'Identifier and new password required' });
  }

  try {
    const userDoc = await findUser(identifier);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: user } = userDoc;
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Use user.email or user.mobile as consistent key
    const otpKey = user.email || user.mobile;
    otpStore[otpKey] = { otp, expiresAt, newPassword };

    if (user.email) {
      await transporter.sendMail({
        to: user.email,
        subject: 'Reset Password OTP - Maestrominds',
        html: `<p>Your OTP to reset password is <b>${otp}</b>. It expires in 5 minutes.</p>`,
      });
    }

    console.log('[RESET OTP SENT] to:', user.email || identifier);
    return res.status(200).json({ message: 'OTP sent for password reset' });

  } catch (err) {
    console.error('[RESET OTP ERROR]:', err);
    return res.status(500).json({ message: 'Failed to send reset OTP' });
  }
};

// RESET STEP 2: Confirm OTP and update password
export const resetPassword = async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ message: 'Identifier and OTP required' });
  }

  try {
    // ✅ Step 1: Find user from Firestore
    const userDoc = await findUser(identifier);
    if (!userDoc) {
      console.log('[RESET] User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const { id, data: user } = userDoc;
    const otpKey = user.email || user.mobile;

    // ✅ Step 2: Get OTP data using correct key
    const stored = otpStore[otpKey];

    if (!stored) {
      console.log('[RESET] No OTP stored for', otpKey);
      return res.status(400).json({ message: 'No OTP found for this user' });
    }

    if (stored.otp !== otp) {
      console.log('[RESET] Invalid OTP');
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (stored.expiresAt < Date.now()) {
      console.log('[RESET] OTP expired');
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (!stored.newPassword) {
      console.log('[RESET] New password not found in OTP store');
      return res.status(400).json({ message: 'Missing new password in OTP data' });
    }

    // ✅ Step 3: Hash and update password
    const hashedPassword = await bcrypt.hash(stored.newPassword, 10);
    await db.collection('admins').doc(id).update({ password: hashedPassword });

    // ✅ Step 4: Send confirmation email
    if (user.email) {
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Changed - Maestrominds',
        html: `
          <p>Hello <b>${user.email}</b>,</p>
          <p>Your password was successfully changed.</p>
          <p>If you did not do this, please contact support immediately.</p>
        `,
      });
    }

    // ✅ Step 5: Clean up
    delete otpStore[otpKey];
    console.log('[RESET] Password changed for:', otpKey);
    return res.status(200).json({ success: true, message: 'Password reset successful' });

  } catch (err) {
    console.error('[RESET ERROR]:', err);
    return res.status(500).json({ message: 'Password reset failed' });
  }
};

