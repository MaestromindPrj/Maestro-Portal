import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';      // Employee routes
import internRoutes from './routes/internRoutes.js';  // Intern routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// === Routes ===
app.use('/api/employee', authRoutes);  // All employee routes like /api/employee/send-otp
app.use('/api/intern', internRoutes);  // All intern routes like /api/intern/send-otp

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
