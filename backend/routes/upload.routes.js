const express = require("express");
const uploadController = require("../controllers/upload.controller");

const router = express.Router();

// Upload endpoint
router.post("/upload", uploadController.uploadToMongoDB);

// Health check endpoint
router.get("/health", uploadController.healthCheck);

module.exports = router;
