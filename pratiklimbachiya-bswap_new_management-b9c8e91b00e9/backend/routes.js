const express = require("express");
const bSmartSwapRoutes = require("./routes/bSwapRoutes");

// Routes Path

const app = express.Router();
// Routes
app.use("/api/v1/bswapMngment", bSmartSwapRoutes);
app.all("/*", (req, res) =>
  res.status(404).json({ message: "Invalid Request" })
);

module.exports = app;
