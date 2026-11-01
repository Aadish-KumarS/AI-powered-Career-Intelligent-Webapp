import User from "../models/User.js";
import bcrypt from 'bcryptjs';

const AI_RESULT_KEYS = new Set(['careerGuidance', 'careerAnalysis', 'examRecommendations']);
const MAX_AI_RESULT_BYTES = 2 * 1024 * 1024;

const validateResultKey = (service) => AI_RESULT_KEYS.has(service);

export const getAiServiceResult = async (req, res) => {
  const { service } = req.params;
  if (!validateResultKey(service)) return res.status(400).json({ message: 'Unsupported AI service' });

  try {
    const user = await User.findById(req.user.id).select(`aiServiceResults.${service}`).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const saved = user.aiServiceResults?.[service];
    return res.json({ result: saved?.result ?? null, generatedAt: saved?.generatedAt ?? null });
  } catch (error) {
    console.error('Unable to retrieve saved AI result:', error);
    return res.status(500).json({ message: 'Unable to retrieve saved result' });
  }
};

export const saveAiServiceResult = async (req, res) => {
  const { service } = req.params;
  const { result } = req.body;
  if (!validateResultKey(service)) return res.status(400).json({ message: 'Unsupported AI service' });
  if (result === undefined || result === null) return res.status(400).json({ message: 'A result is required' });

  try {
    const serialized = JSON.stringify(result);
    if (serialized.length > MAX_AI_RESULT_BYTES) {
      return res.status(413).json({ message: 'Generated result is too large to save' });
    }

    const generatedAt = new Date();
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { [`aiServiceResults.${service}`]: { result, generatedAt } } },
      { new: true, runValidators: true, projection: { [`aiServiceResults.${service}`]: 1 } }
    ).lean();

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ result: user.aiServiceResults?.[service]?.result, generatedAt });
  } catch (error) {
    console.error('Unable to save AI result:', error);
    return res.status(500).json({ message: 'Unable to save generated result' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedFields = [
      "name",
      "email",
      "profilePicture",
      "bio",
      "location",
      "latitude",
      "longitude",
      "interests",
      "education",
      "personalInfo",
      "skills",
      "careerInfo",
      "preferences",
      "experience",
      "insights",
      "isFirstTime"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => 
        allowedFields.includes(key) && value !== undefined
      )
    );

    if (updates.email) {
      updates.email = updates.email.trim().toLowerCase();
      const userWithEmail = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
      if (userWithEmail) return res.status(409).json({ message: 'That email address is already in use' });
    }

    Object.assign(user, updates);
    const updatedUser = await user.save();

    return res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error('Profile update failed:', error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const validatePassword = async (req, res, next) => {
  try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
          return res.status(400).json({ message: 'All fields are required' });
      }

      if (newPassword !== confirmPassword) {
          return res.status(400).json({ message: 'Passwords do not match' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (!user.password) {
          return res.status(400).json({ message: 'Google-managed accounts do not have a local password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect current password' });
      }

      req.user = user;
      next(); 
  } catch (error) {
      console.error('Error in validatePassword middleware:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

export default validatePassword;

export const updateOnboarding = async (req, res) => {
  const userId = req.user.id;
  const allowedFields = ['name', 'personalInfo', 'education', 'skills', 'careerInfo', 'experience', 'insights', 'preferences', 'interests', 'onboardingProgress', 'isFirstTime'];
  const onboardingData = Object.fromEntries(
    Object.entries(req.body).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
  );

  try {
    // Enforce the same minimum profile that the AI services need. Optional
    // fields stay optional and the persisted document structure is unchanged.
    if (onboardingData.isFirstTime === false || onboardingData.onboardingProgress === 100) {
      const errors = {};
      if (!onboardingData.name?.trim()) errors.name = 'Full name is required.';
      if (!onboardingData.education?.highestLevel) errors['education.highestLevel'] = 'Education level is required.';
      if (!onboardingData.education?.fieldOfStudy?.trim()) errors['education.fieldOfStudy'] = 'Field of study is required.';
      if (!Array.isArray(onboardingData.skills?.selectedSkills) || onboardingData.skills.selectedSkills.length === 0) {
        errors.skills = 'Add at least one technical or soft skill.';
      }
      if (!onboardingData.careerInfo?.careerStage) errors['careerInfo.careerStage'] = 'Career stage is required.';
      if (!Array.isArray(onboardingData.careerInfo?.desiredRoles) || onboardingData.careerInfo.desiredRoles.length === 0) {
        errors['careerInfo.desiredRoles'] = 'Select at least one desired role.';
      }
      if (Object.keys(errors).length) {
        return res.status(422).json({ message: 'Complete the required onboarding fields.', errors });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: onboardingData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
