import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const serverOrigin = (process.env.SERVER_ORIGIN || `http://localhost:${process.env.PORT || 5001}`).replace(/\/$/, '');
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || `${serverOrigin}/auth/google/callback`;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackUrl,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({
        $or: [{ googleId: profile.id }, { email: profile.emails?.[0]?.value }]
      });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos?.[0]?.value || '',
          provider: 'google',
          isVerified: true
        });
      } else if (!user.googleId) {
        user.googleId = profile.id;
        user.provider = 'google';
        user.isVerified = true;
        if (!user.profilePicture && profile.photos?.[0]?.value) user.profilePicture = profile.photos[0].value;
        await user.save();
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
