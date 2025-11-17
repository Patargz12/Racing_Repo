const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const upload = require("../config/multer.config");

/**
 * POST /api/chat
 * Send a question to the chatbot (with optional file upload)
 */
router.post("/chat", upload.single("file"), chatController.chat);

/**
 * POST /api/test-upload
 * Test endpoint to debug multipart/form-data
 */
router.post("/test-upload", upload.single("file"), chatController.testUpload);

/**
 * GET /api/sample-questions
 * Get sample questions for the user
 */
router.get("/sample-questions", chatController.getSampleQuestions);

module.exports = router;
