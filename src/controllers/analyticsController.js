import Expense from "../models/Expense.js";

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    const categoryMap = {};
    const monthlyMap = {};

    expenses.forEach((item) => {
      // Income & Expense
      if (item.type === "income") {
        totalIncome += item.amount;
      } else {
        totalExpense += item.amount;

        // Category Data
        if (categoryMap[item.category]) {
          categoryMap[item.category] += item.amount;
        } else {
          categoryMap[item.category] = item.amount;
        }
      }

      // Monthly Data
      const month = new Date(item.date).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          month,
          income: 0,
          expense: 0,
        };
      }

      if (item.type === "income") {
        monthlyMap[month].income += item.amount;
      } else {
        monthlyMap[month].expense += item.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    const categoryData = Object.keys(categoryMap).map((key) => ({
      category: key,
      amount: categoryMap[key],
    }));

    const monthlyData = Object.values(monthlyMap);

    res.status(200).json({
      success: true,
      analytics: {
        totalIncome,
        totalExpense,
        balance,
        totalTransactions: expenses.length,
        categoryData,
        monthlyData,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};