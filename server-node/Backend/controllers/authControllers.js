import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/Otp.js'; 
import sendEmail from '../utils/sendEmail.js';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const normalizeEmail = (email = '') => email.trim().toLowerCase();

const publicUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  const { password, googleId, __v, ...safeUser } = userObject;
  return safeUser;
};

const createAuthToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

// REGISTER / SIGNUP
export const register = async (req, res) => {
  try {
    const { password } = req.body;
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and an 8-character password are required" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 1000000);

    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

    await OTP.findOneAndUpdate(
      { email },
      { $set: { otp, expiration: otpExpiration } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    res.cookie('email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/' 
    });
    
    const otpMessage = `Your OTP for email verification is: ${otp}. It will expire in 10 minutes.`;
    await sendEmail(email, "Verify Your Email", otpMessage);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });
    
    await newUser.save();

    res.status(201).json({ message: "User registered! Check your email for OTP verification." });

  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: "Unable to create your account right now" });
  }
};


//LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.clearCookie('email');
    res.clearCookie('passwordResetToken', { path: '/api/auth/reset-password' });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

//EMAIL & PASSWORD LOGIN
export const login = async (req, res) => {
  try {
    const password = req.body.password;
    const email = normalizeEmail(req.body.email);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      res.cookie('email', email, {
        httpOnly: true,
        secure: false, 
        maxAge: 60 * 60 * 1000,
        path: '/' 
      });
      
      return res.status(400).json({ message: "Please verify your email before logging in." });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google sign-in. Continue with Google instead.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();
    const token = createAuthToken(user._id);
    res.json({ token, user: publicUser(user) });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Unable to sign in right now" });
  }
};


//GOOGLE AUTH ==================================================
//GOOGLE AUTH ==================================================

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) return res.status(400).json({ message: 'Google credential is required' });
    const ticket = await client.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });
    const { name, email: profileEmail, picture, sub: googleId } = ticket.getPayload();
    const email = normalizeEmail(profileEmail);
    if (!email) return res.status(400).json({ message: 'Google did not return an email address' });

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = new User({ name, email, googleId, profilePicture: picture || '', provider: 'google', isVerified: true });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.provider = 'google';
      user.isVerified = true;
      if (!user.profilePicture && picture) user.profilePicture = picture;
      await user.save();
    }

    const jwtToken = createAuthToken(user._id);

    res.json({ token: jwtToken, user: publicUser(user) });
  } catch (error) {
    console.error('Google login failed:', error);
    res.status(500).json({ message: "Google sign-in could not be completed" });
  }
};
