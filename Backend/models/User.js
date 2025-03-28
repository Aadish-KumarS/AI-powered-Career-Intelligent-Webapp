import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    isFirstTime: { type: Boolean, default: true },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    location: { type: String, maxlength: 100 },
    latitude: { type: Number },
    longitude: { type: Number },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
    lastLogin: { type: Date },
    isDeleted: { type: Boolean, default: false },
    interests: [
      {
        type: String,
        required: true,
        enum: ['Technology', 'Science', 'Art', 'Music', 'Sports', 'Literature', 'Traveling'],
      }
    ],
    education: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
