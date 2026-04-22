const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const {
  getSolarOptimizationAdvice,
} = require("./services/optimizationService");
const { getLatestInverterData } = require("./services/influxService");

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/api/status", (req, res) => {
  res.json({ status: "Solar Optimizer Backend is running" });
});

app.get("/api/optimize", async (req, res) => {
  const advice = await getSolarOptimizationAdvice();
  res.json(advice);
});

app.get("/api/data", async (req, res) => {
  try {
    const data = await getLatestInverterData();
    res.json(data || { message: "No data available yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
