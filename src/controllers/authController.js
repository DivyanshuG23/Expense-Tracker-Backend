import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../services/googleAuthService.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ==========================
// Register User
// ==========================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create User
    const user = await User.create({
      fullName,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Login User
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // Compare Password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Store JWT in HTTP-only Cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Google Login
// ==========================
export const googleLogin = async (req, res) => {
  try {
    const rawToken = req.body?.idToken || req.body?.credential;

    // Validation
    if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId || !googleClientId.trim()) {
      return res.status(500).json({
        success: false,
        message:
          "Google authentication is temporarily unavailable: GOOGLE_CLIENT_ID is not configured on server.",
      });
    }

    // Verify Google ID Token via google-auth-library
    let verifiedPayload;
    try {
      verifiedPayload = await verifyGoogleIdToken(rawToken, googleClientId);
    } catch (verifyError) {
      const status = verifyError.statusCode || 401;
      return res.status(status).json({
        success: false,
        message: verifyError.message || "Google authentication failed",
      });
    }

    const { googleId, email, name: fullName, avatar: profileImage } =
      verifiedPayload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account email not found",
      });
    }

    // Find Existing User by email
    let user = await User.findOne({ email });

    // Create User if not exists
    if (!user) {
      user = await User.create({
        fullName,
        email,
        password: `google_${googleId}_${Date.now()}`,
        profileImage: profileImage || "",
      });
    } else if (!user.profileImage && profileImage) {
      user.profileImage = profileImage;
      await user.save();
    }

    // Generate Our Own JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Store JWT in HTTP-only Cookie for backward compatibility
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Google Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Google Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Current User
// ==========================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Update Current User
// ==========================
export const updateCurrentUser = async (req, res) => {
  try {
    const { fullName, phone, occupation, city } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update Profile Fields
    user.fullName = fullName.trim();
    user.phone = phone?.trim() || "";
    user.occupation = occupation?.trim() || "";
    user.city = city?.trim() || "";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        occupation: user.occupation,
        city: user.city,
      },
    });
  } catch (error) {
    console.log("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Logout User
// ==========================
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.log("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
}; 