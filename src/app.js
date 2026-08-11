import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();

import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://expense-tracker-iota-flax.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/profile", profileRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 ExpenseFlow Backend Running...");
});

export default app; 