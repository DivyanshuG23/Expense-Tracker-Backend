import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Analytics
router.get("/", authMiddleware, getAnalytics);

export default router;