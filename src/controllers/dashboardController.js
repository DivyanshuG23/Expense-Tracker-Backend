import Expense from "../models/Expense.js";

// ==========================
// Dashboard Summary
// ==========================
export const getDashboardSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    let totalIncome = 0;
    let totalExpense = 0;

    let incomeCount = 0;
    let expenseCount = 0;

    expenses.forEach((item) => {
      if (item.type === "income") {
        totalIncome += Number(item.amount || 0);
        incomeCount++;
      } else {
        totalExpense += Number(item.amount || 0);
        expenseCount++;
      }
    });

    const totalBalance = totalIncome - totalExpense;

    const recentTransactions = expenses.slice(0, 5);

    return res.status(200).json({
      success: true,
      summary: {
        totalBalance,
        totalIncome,
        totalExpense,
        incomeCount,
        expenseCount,
        totalTransactions: expenses.length,
        recentTransactions,
      },
    });
  } catch (error) {
    console.log("Dashboard Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Dashboard Analytics
// ==========================
export const getDashboardAnalytics = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Year coming from frontend
    const requestedYear = Number(req.query.year);

    // If no year is provided, use current year
    const year =
      Number.isInteger(requestedYear) && requestedYear > 0
        ? requestedYear
        : currentYear;

    // Start of selected year
    const startDate = new Date(year, 0, 1);

    // Start of next year
    const endDate = new Date(year + 1, 0, 1);

    // Get only selected year's expenses
    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // ==========================
    // Month Names
    // ==========================
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // ==========================
    // Create all 12 months
    // ==========================
    const monthlyData = {};

    monthNames.forEach((month) => {
      monthlyData[month] = {
        income: 0,
        expense: 0,
      };
    });

    // ==========================
    // Calculate Monthly Data
    // ==========================
    expenses.forEach((item) => {
      const date = new Date(item.date);

      const month = date.toLocaleString("default", {
        month: "short",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = {
          income: 0,
          expense: 0,
        };
      }

      if (item.type === "income") {
        monthlyData[month].income += Number(item.amount || 0);
      } else {
        monthlyData[month].expense += Number(item.amount || 0);
      }
    });

    return res.status(200).json({
      success: true,
      year,
      analytics: monthlyData,
    });
  } catch (error) {
    console.log("Dashboard Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};