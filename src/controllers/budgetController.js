import Budget from "../models/budgetModel.js";
import Expense from "../models/expense.js";

// ==========================
// Add Budget
// ==========================
export const addBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category || limit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Category and limit are required",
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category: category.trim(),
      limit: Number(limit),
      spent: 0,
    });

    res.status(201).json({
      success: true,
      budget,
    });
  } catch (error) {
    console.log("Add Budget Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create budget",
    });
  }
};

// ==========================
// Get Budgets
// ==========================
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
    });

    // Get only user's expenses
    const expenses = await Expense.find({
      user: req.user.id,
      type: "expense",
    });

    // Calculate spent for every budget
    const updatedBudgets = budgets.map((budget) => {
      const spent = expenses
        .filter(
          (expense) =>
            expense.category.toLowerCase() ===
            budget.category.toLowerCase()
        )
        .reduce(
          (total, expense) => total + Number(expense.amount || 0),
          0
        );

      return {
        ...budget.toObject(),
        spent,
      };
    });

    res.status(200).json({
      success: true,
      budgets: updatedBudgets,
    });
  } catch (error) {
    console.log("Get Budgets Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
    });
  }
};

// ==========================
// Update Budget
// ==========================
export const updateBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        category: category?.trim(),
        limit: Number(limit),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    console.log("Update Budget Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update budget",
    });
  }
};

// ==========================
// Delete Budget
// ==========================
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.log("Delete Budget Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete budget",
    });
  }
}; 