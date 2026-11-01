import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import resetRoutes from './routes/resetRoutes.js'
import otpRoutes from './routes/otpRoutes.js'
import location from './routes/location.js'
import userRoutes from './routes/userRoutes.js'
import passport from 'passport';
import cookieParser from "cookie-parser";
import './config/passport.js'
import jwt from 'jsonwebtoken';

dotenv.config(); 

const PORT = process.env.PORT || 5001;
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const allowedOrigins = [...new Set([
  CLIENT_URL,
  ...(process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
])];

const app = express();

// Middleware
app.set('trust proxy', 1);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(Object.assign(new Error('Origin is not allowed by CORS'), { status: 403 }));
  },
  credentials: true
}));
app.use(cookieParser());

app.use(passport.initialize());

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/auth", resetRoutes);
app.use('/otp', otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api",location)
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?oauth=failed`, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // A URL fragment stays in the browser and is not included in HTTP request logs.
    res.redirect(303, `${CLIENT_URL}/auth/google/callback#token=${encodeURIComponent(token)}`);
  }
);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error('Unhandled server error:', error);
  res.status(status).json({ message: status === 403 ? error.message : 'Server error' });
});

const startServer = async () => {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error('MONGO_URI and JWT_SECRET must be configured before starting the API');
  }
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error('Unable to start API:', error.message);
  process.exitCode = 1;
});

export default app;
