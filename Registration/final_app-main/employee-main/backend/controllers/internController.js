import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Intern from '../models/intern.js';
import sendEmail from '../utils/sendEmail.js';

dotenv.config();

const otpStore = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// === Send OTP ===
export const sendInternOtp = async (req, res) => {
  const { email } = req.body;  // ✅ Using email consistently
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

// === Register (NO bcrypt) ===
export const registerIntern = async (req, res) => {
  const { name, mobile, age, college, year, email, password, otp } = req.body;
  const storedOtp = otpStore[email];

  if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    const exists = await Intern.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Intern already registered' });

    const resumePath = req.files?.resume?.[0]?.path;
    const aadharPath = req.files?.aadhar?.[0]?.path;

    const newIntern = new Intern({
      name,
      mobileNumber: mobile,
      age,
      collegeName: college,      // ✅ mapping 'college' (frontend) to 'collegeName' (model)
      yearOfStudy: year,
      email,
      password,
      resume: resumePath,
      aadhar: aadharPath,
      isVerified: true,
    });

    await newIntern.save();
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
export const loginIntern = async (req, res) => {
  let { identifier, password } = req.body;

  try {
    // ✅ Clean input
    identifier = identifier.trim();

    // ✅ Find intern by email (case-insensitive) or mobile number (exact)
    const intern = await Intern.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { mobileNumber: identifier }
      ]
    });

    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    // ✅ Check password (plain text for now)
    if (intern.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // ✅ Generate token
    const token = jwt.sign(
      { email: intern.email, mobileNumber: intern.mobileNumber, name: intern.name },
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
export const resetInternPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;
  const storedOtp = otpStore[email];

  if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    const intern = await Intern.findOne({ email });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    intern.password = newPassword; // ❗ Stored as plain text
    await intern.save();

    delete otpStore[email];

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};
