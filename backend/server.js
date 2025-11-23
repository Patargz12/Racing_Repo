require("dotenv").config();
const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/upload.routes");
const chatRoutes = require("./routes/chat.route");

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      'http://localhost:3000',           // Local frontend development
      'http://localhost:5173',           // Alternative local port
      process.env.FRONTEND_URL,          // Production frontend URL from env
      /\.vercel\.app$/,                  // All Vercel preview deployments
    ].filter(Boolean); // Remove undefined values
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway but log warning (change to false for strict mode)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
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
