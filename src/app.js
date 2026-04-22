const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const { getSolarOptimizationAdvice } = require("./services/optimizationService");
const { getLatestInverterData } = require("./services/influxService");

const app = express();

// Security & Logging Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

app.get("/api/status", (req, res) => {
  res.json({ status: "Solar Optimizer Backend is running" });
});

app.get("/api/optimize", async (req, res) => {
  try {
    const advice = await getSolarOptimizationAdvice();
    res.json(advice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const data = await getLatestInverterData();
    res.json(data || { message: "No data available yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
