import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import resetRoutes from './routes/resetRoutes.js'
import otpRoutes from './routes/otpRoutes.js'
import passport from 'passport';
import cookieParser from "cookie-parser";
import session from "express-session";
import './config/passport.js'

dotenv.config(); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,     
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());




// Routes
app.use('/api/auth', authRoutes);
app.use("/api/auth", resetRoutes);
app.use('/otp', otpRoutes);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    res.redirect('http://localhost:5173/profile');
  }
);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
