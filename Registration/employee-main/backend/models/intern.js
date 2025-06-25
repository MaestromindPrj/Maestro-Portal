import mongoose from 'mongoose';


const internSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  age: { type: Number, required: true },
  collegeName: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  resume: { type: String, required: true }, // File path or URL
  aadhar: { type: String, required: true }, // File path or URL
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 🔐 Password should be hashed
  otp: { type: String },                     // ➔ OTP for email verification
  otpExpires: { type: Date },                // I corrected the key to `otpExpires` to match your usage
  isVerified: { type: Boolean, default: false },              // ➔ OTP expiry time
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

const Intern = mongoose.model('Intern', internSchema);

export default Intern