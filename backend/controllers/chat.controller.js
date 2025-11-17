const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parseFile } = require("../utils/excel-parser");
const chatModel = require("../models/chat.model");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure the model - Using Gemini 2.5 Flash
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

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
    // Safely extract question from req.body (may be undefined with multipart/form-data)
    const question = req.body?.question || "";
    const file = req.file; // File from multer
    const mode = req.body?.mode || "chat"; // 'chat' or 'explain'

    console.log("📦 Request body:", req.body);
    console.log("📎 File received:", file ? file.originalname : "No file");
    console.log("🎯 Mode:", mode);

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

    // Query MongoDB for relevant racing data based on the question
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

    // Prepare the system prompt based on mode
    let systemPrompt = "";

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

      systemPrompt += "You have access to racing data from multiple sources:\n";
      systemPrompt += "- Race results and standings (positions, times, gaps)\n";
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

    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text:
                mode === "explain"
                  ? "Understood! I've received the racing dataset and I'm ready to provide a comprehensive analysis. I'll examine the data structure, identify key metrics, detect patterns, highlight anomalies, and deliver actionable insights focused on racing performance and strategy."
                  : mongoContext || fileContext
                  ? "Understood! I've received and analyzed the racing data. I'm ready to help you understand and answer questions about this data. What would you like to know?"
                  : "Understood! I'm here to help with all things Toyota Gazoo Racing. Whether it's race results, driver performance, technical data, or general racing questions, I'm ready to assist. What would you like to know?",
            },
          ],
        },
      ],
    });

    // Prepare the user's message based on mode
    let userMessage = question;
    if (mode === "explain" && !question) {
      userMessage =
        "Please analyze this racing dataset and provide a comprehensive explanation following the structured format. Include: data overview, key metrics, patterns & insights, anomalies, and actionable takeaways. Make sure your explanation is short and simple";
    } else if (!question) {
      userMessage =
        "Please analyze the uploaded file and provide insights. Make sure your explanation is short and simple.";
    }

    // Send the user's question
    const result = await chatSession.sendMessage(userMessage);
    const answer = result.response.text();

    console.log(`✅ Generated response: ${answer.substring(0, 100)}...`);

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
