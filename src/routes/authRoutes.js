import express from "express";

import {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
  updateCurrentUser,
  logoutUser,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

// Google Login
router.post("/google", googleLogin);

// Protected Routes
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateCurrentUser);
router.post("/logout", logoutUser);

export default router;