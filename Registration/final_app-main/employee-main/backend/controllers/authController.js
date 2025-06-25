import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import sendEmail from '../utils/sendEmail.js';

dotenv.config();

const otpStore = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// === Send OTP ===
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const otp = generateOtp();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    await sendEmail(email, 'OTP Verification', `Your OTP is: ${otp}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// === Register ===
export const register = async (req, res) => {
  const { name, age, mobile, email, password, otp } = req.body;
  const storedOtp = otpStore[email];

  if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Employee already registered' });

    const newUser = new User({
      name,
      age,
      mobile,
      email,
      password, // ❗ Stored in plain text — recommend bcrypt later
    });

    await newUser.save();
    delete otpStore[email];

    try {
      await sendEmail(
        email,
        '🎉 Registration Successful - Welcome to Maestrominds!',
        `
Hi ${name} 👋,

Thank you for registering with Maestrominds! 🎉
✅ Your account has been successfully created.
📧 Email: ${email}

Best regards,
Maestrominds Team 💼
        `
      );
    } catch (emailErr) {
      console.error('❌ Failed to send confirmation email:', emailErr);
    }

    res.status(201).json({ success: true, message: 'Registered successfully' });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// === Login ===
export const login = async (req, res) => {
  let { identifier, password } = req.body;

  try {
    identifier = identifier.trim();

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }]
    });

    if (!user) return res.status(404).json({ message: 'Employee not found' });
    if (user.password !== password) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { email: user.email, mobile: user.mobile, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ success: true, message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// === Reset Password ===
export const resetPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;
  const storedOtp = otpStore[email];

  if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    user.password = newPassword; // ❗ Plain text, recommend bcrypt later
    await user.save();

    delete otpStore[email];
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};
