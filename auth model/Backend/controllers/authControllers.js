import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/Otp.js'; 
import sendEmail from '../utils/sendEmail.js';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER / SIGNUP
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

    const existingOtp =await OTP.findOne({email});

    if(existingOtp){
      existingOtp.otp = otp;
      existingOtp.expiration = otpExpiration;
      await existingOtp.save();
    }else{
      const otpEntry = new OTP({ email, otp, expiration: otpExpiration });
      await otpEntry.save();
    }
    
    res.cookie('email', email, {
      httpOnly: true,
      secure: false, 
      maxAge: 60 * 60 * 1000,
      path: '/' 
    });
    
    const otpMessage = `Your OTP for email verification is: ${otp}. It will expire in 10 minutes.`;
    await sendEmail(email, "Verify Your Email", otpMessage);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verified: false,
    });
    
    await newUser.save();

    res.status(201).json({ message: "User registered! Check your email for OTP verification." });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


//LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    req.logout(() => {});
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

//EMAIL & PASSWORD LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


//GOOGLE AUTH ==================================================
//GOOGLE AUTH ==================================================

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });
    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, googleId, isVerified: true });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token: jwtToken, user });
  } catch (error) {
    res.status(500).json({ message: "Google Login Failed", error });
  }
};

