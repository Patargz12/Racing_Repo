const { parseFile } = require("../utils/excel-parser");
const chatModel = require("../models/chat.model");
const sessionManager = require("../utils/session-manager");

// Generation config for Gemini
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

/**
 * Handle chat requests from the frontend
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.chat = async (req, res) => {
  try {
    // Extract request parameters
    const question = req.body?.question || "";
    const file = req.file; // File from multer
    const mode = req.body?.mode || "chat"; // 'chat' or 'explain'
    const sessionId = req.body?.sessionId; // Session ID from frontend

    console.log("📦 Request body:", req.body);
    console.log("📎 File received:", file ? file.originalname : "No file");
    console.log("🎯 Mode:", mode);
    console.log("🔑 Session ID:", sessionId || "No session ID provided");

    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
      });
    }

    // Validate input - either question or file is required
    if (!question && !file) {
      return res.status(400).json({
        error: "Question or file is required",
      });
    }

    // If question is provided, validate it's a string
    if (question && typeof question !== "string") {
      return res.status(400).json({
        error: "Question must be a string",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured",
      });
    }

    console.log(`📩 Received question: ${question || "(no text, file only)"}`);
    if (file) {
      console.log(
        `📎 Received file: ${file.originalname} (${file.size} bytes)`
      );
    }

    // Check if session exists
    const existingSession = sessionManager.getSessionStats(sessionId);
    const isNewSession = !existingSession;

    // Parse Excel file if provided
    let fileContext = "";
    if (file) {
      try {
        fileContext = parseFile(file.buffer, file.originalname);
        console.log(
          `✅ Successfully parsed file: ${file.originalname} (${fileContext.length} characters)`
        );
      } catch (parseError) {
        console.error("❌ File parsing error:", parseError);
        return res.status(400).json({
          error: "Failed to parse the uploaded file",
          details: parseError.message,
        });
      }
    }

    // Query MongoDB for relevant racing data
    // Query on EVERY message to ensure we get the right collection for each question
    let mongoContext = "";
    let queryResults = null;

    if (question && process.env.MONGODB_URI) {
      try {
        console.log("🔍 Querying MongoDB for racing data...");
        queryResults = await chatModel.queryRaceData(question);

        if (queryResults.hasData) {
          mongoContext = chatModel.formatContextForGemini(queryResults);
          console.log(
            `✅ Retrieved racing data from ${
              Object.keys(queryResults.results).length
            } collection(s)`
          );
          console.log(
            `📊 Collections queried: ${Object.keys(queryResults.results)
              .map((k) => queryResults.results[k].collectionName)
              .join(", ")}`
          );
        } else {
          console.log(
            "ℹ️  No specific racing data found, using general knowledge"
          );
        }
      } catch (mongoError) {
        console.error(
          "⚠️  MongoDB query error (continuing with general knowledge):",
          mongoError.message
        );
        // Don't fail the request, just continue without MongoDB context
      }
    }

    // Prepare system prompt only for new sessions
    let systemPrompt = "";

    if (isNewSession) {
      if (mode === "explain") {
        // Specialized AI Agent for Data Explanation
        systemPrompt =
          "You are an expert in Toyota Gazoo Racing analytics. You specialize in interpreting racing datasets, identifying patterns, and delivering concise insights. When given a file, you quickly summarize its structure, highlight key metrics, detect correlations, surface anomalies, and provide short, actionable observations. Your explanations are always brief, clear, and focused on what matters most for racing performance and strategy.\n\n";

        systemPrompt += "When analyzing data, follow this structure:\n";
        systemPrompt +=
          "1. **Data Overview**: Briefly describe what the dataset contains\n";
        systemPrompt +=
          "2. **Key Metrics**: Highlight the most important numbers and values\n";
        systemPrompt +=
          "3. **Patterns & Insights**: Identify trends, correlations, or notable observations\n";
        systemPrompt +=
          "4. **Anomalies**: Point out any unusual or unexpected data points\n";
        systemPrompt +=
          "5. **Actionable Takeaways**: Provide brief, strategic recommendations\n\n";

        if (fileContext) {
          systemPrompt += `📊 DATASET TO ANALYZE:\n${fileContext}\n\n`;
        }

        if (mongoContext) {
          systemPrompt += `📊 ADDITIONAL RACING DATA:\n${mongoContext}\n\n`;
        }
      } else {
        // Regular chat mode
        systemPrompt =
          "You are a helpful assistant for Toyota Gazoo Racing. You help users understand racing data, performance statistics, and answer questions about Toyota's racing programs. Be informative, professional, and enthusiastic about motorsports.\n\n";

        systemPrompt +=
          "You have access to racing data from multiple sources:\n";
        systemPrompt +=
          "- Race results and standings (positions, times, gaps)\n";
        systemPrompt += "- Lap times and performance data\n";
        systemPrompt += "- Weather conditions during races\n";
        systemPrompt += "- Vehicle and driver information\n";
        systemPrompt += "- Analysis and endurance data\n\n";

        if (mongoContext) {
          systemPrompt += mongoContext;
        }

        if (fileContext) {
          systemPrompt += `\n\n📊 ADDITIONAL CONTEXT FROM UPLOADED FILE:\n${fileContext}\n\nPlease use this data to answer the user's questions accurately. Reference specific data points from the file when relevant.`;
        }

        if (!mongoContext && !fileContext) {
          systemPrompt +=
            "Note: If asked about specific race data, answer based on your general knowledge of Toyota Gazoo Racing and motorsports.";
        }
      }
    }

    // Get or create session
    const session = sessionManager.getOrCreateSession(sessionId, {
      generationConfig,
      systemPrompt,
      mode,
      mongoContext,
      fileContext,
    });

    // Prepare user message with context injection for existing sessions
    let userMessage = question;

    // For existing sessions, inject new MongoDB context or file context
    if (!isNewSession) {
      let contextInjection = "";

      // Add MongoDB context if available
      if (mongoContext) {
        contextInjection += `[New racing data retrieved for your question]\n\n${mongoContext}\n\n`;
      }

      // Add file context if available
      if (fileContext) {
        contextInjection += `[New file uploaded: ${file.originalname}]\n\nFile content:\n${fileContext}\n\n`;
      }

      // Combine context with user question
      if (contextInjection) {
        userMessage = `${contextInjection}User question: ${
          question || "Please analyze this data."
        }`;
      }
    }
    // For new sessions with special modes
    else if (mode === "explain" && !question) {
      userMessage =
        "Please analyze this racing dataset and provide a comprehensive explanation following the structured format. Include: data overview, key metrics, patterns & insights, anomalies, and actionable takeaways. Make sure your explanation is short and simple";
    } else if (!question && fileContext) {
      userMessage =
        "Please analyze the uploaded file and provide insights. Make sure your explanation is short and simple.";
    }

    // Send the user's question to the existing chat session
    const result = await session.chatSession.sendMessage(userMessage);
    const answer = result.response.text();

    // Increment message count
    sessionManager.incrementMessageCount(sessionId);

    // Get session stats for response
    const sessionStats = sessionManager.getSessionStats(sessionId);

    console.log(`✅ Generated response: ${answer.substring(0, 100)}...`);
    console.log(
      `📊 Session stats - Messages: ${
        sessionStats.messageCount
      }, Age: ${Math.round((Date.now() - sessionStats.createdAt) / 60000)} min`
    );

    // Send response
    res.json({
      answer: answer,
      success: true,
      fileProcessed: !!file,
      fileName: file?.originalname,
      mongoDataUsed: !!mongoContext,
      collectionsQueried: queryResults?.hasData
        ? Object.keys(queryResults.results).map(
            (key) => queryResults.results[key].collectionName
          )
        : [],
      sessionInfo: {
        sessionId,
        messageCount: sessionStats.messageCount,
        isNewSession,
      },
    });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    });
  }
};

/**
 * Get sample questions for the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSampleQuestions = (req, res) => {
  const sampleQuestions = [
    "What is Toyota Gazoo Racing?",
    "Tell me about Toyota's racing history",
    "What racing series does Toyota compete in?",
    "Who are Toyota's top racing drivers?",
    "What is the Toyota GR86?",
    "Tell me about Toyota's hybrid racing technology",
  ];

  res.json({
    questions: sampleQuestions,
    success: true,
  });
};

/**
 * Test endpoint to debug multipart/form-data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.testUpload = (req, res) => {
  console.log("=== TEST UPLOAD DEBUG ===");
  console.log("Body:", req.body);
  console.log("File:", req.file);
  console.log("Headers:", req.headers);

  res.json({
    success: true,
    body: req.body,
    file: req.file
      ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        }
      : null,
  });
};
