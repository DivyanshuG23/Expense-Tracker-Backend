import express from "express";
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET All Expenses
router.get("/", authMiddleware, getExpenses);

// CREATE Expense
router.post("/", authMiddleware, addExpense);

// UPDATE Expense
router.put("/:id", authMiddleware, updateExpense);

// DELETE Expense
router.delete("/:id", authMiddleware, deleteExpense);

export default router;