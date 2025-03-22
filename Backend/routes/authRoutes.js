import express from 'express';
import passport from "passport";
import { register, verifyEmail, googleLogin,login,googleAuthCallback,logout } from '../controllers/authControllers.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/google-login', googleLogin);

router.post('/login', login);
router.get('/profile', authenticateUser, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});

// Auth route to initiate Google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/logout", logout);


export default router;
