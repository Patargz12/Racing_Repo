require("dotenv").config();
const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/upload.routes");
const chatRoutes = require("./routes/chat.route");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // For form data

// Routes
app.use("/api", uploadRoutes);
app.use("/api", chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Express server is running on http://localhost:${PORT}`);
  console.log(`📡 Upload API: http://localhost:${PORT}/api/upload`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
