import User from "../models/User.js";

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
      "isFirstTime"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => 
        allowedFields.includes(key) && value !== undefined
      )
    );

    Object.assign(user, updates);
    const updatedUser = await user.save();

    return res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error(error);
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
