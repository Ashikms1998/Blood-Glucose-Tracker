import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from './routes/authRoutes.js'
import readingRoutes from './routes/readingRoutes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);


app.use(express.json());


app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({
      status: "ok",
      dbTime: result.rows[0].now,
    });
  } catch (err) {
    console.error("Health check failed:", err);
    res
      .status(500)
      .json({ status: "error", message: "Database connection failed" });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});


export default app;