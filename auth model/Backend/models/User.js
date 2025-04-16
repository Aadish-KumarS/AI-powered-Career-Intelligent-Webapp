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
    location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
    lastLogin: { type: Date },
    isDeleted: { type: Boolean, default: false },
    personalInfo: {
      currentOccupation: { type: String }
    },

    education: {
      highestLevel: { type: String },
      fieldOfStudy: { type: String },
      institution: { type: String },
      graduationYear: { type: String }
    },

    skills: {
      selectedSkills: [
        {
          name: { type: String },
          level: { type: String }
        }
      ],
      technicalSkills: [
        {
          name: { type: String },
          level: { type: String }
        }
      ],
      softSkills: [
        {
          name: { type: String },
          level: { type: String }
        }
      ]
    },

    careerInfo: {
      careerStage: { type: String },
      careerGoals: [String],
      desiredIndustries: [String],
      desiredRoles: [String]
    },

    experience: {
      currentRole: { type: String },
      yearsOfExperience: { type: String },
      pastRoles: [String]
    },

    insights: {
      careerMotivation: { type: String },
      careerChallenges: { type: String },
      fiveYearGoal: { type: String }
    },

    preferences: {
      personalityType: { type: String },
      workEnvironment: { type: String },
      workStyle: [String],
      notifications: { type: Boolean, default: false },
      darkMode: { type: Boolean, default: false }
    },

    interests: [{ type: String }],

    onboardingProgress: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
