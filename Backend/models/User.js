import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, 
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    bio: { type: String, maxlength: 250 },
    location: { type: String, maxlength: 100 },
    // Track auth provider
    provider: { type: String, enum: ['email', 'google'], default: 'email' }, 
    lastLogin: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
