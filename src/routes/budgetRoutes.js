import express from "express";
import {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add Budget
router.post("/add", authMiddleware, addBudget);

// Get All Budgets
router.get("/all", authMiddleware, getBudgets);

// Update Budget
router.put("/update/:id", authMiddleware, updateBudget);

// Delete Budget
router.delete("/delete/:id", authMiddleware, deleteBudget);

export default router;