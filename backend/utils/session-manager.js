const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Session Manager for maintaining Gemini chat sessions
 * Stores active chat sessions to maintain conversation history
 */
class SessionManager {
  constructor() {
    // Store sessions in memory: sessionId -> session data
    this.sessions = new Map();
    
    // Session timeout: 30 minutes of inactivity
    this.sessionTimeout = 30 * 60 * 1000;
    
    // Cleanup interval: every 5 minutes
    this.cleanupInterval = 5 * 60 * 1000;
    
    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Start cleanup timer
    this.startCleanup();
  }

  /**
   * Get or create a chat session
   * @param {string} sessionId - Unique session identifier
   * @param {Object} config - Configuration for new session
   * @returns {Object} Session data
   */
  getOrCreateSession(sessionId, config = {}) {
    const existingSession = this.sessions.get(sessionId);
    
    if (existingSession) {
      // Update last used timestamp
      existingSession.lastUsedAt = Date.now();
      console.log(`♻️  Reusing existing session: ${sessionId}`);
      return existingSession;
    }
    
    // Create new session
    console.log(`🆕 Creating new session: ${sessionId}`);
    
    const { generationConfig, systemPrompt, mode } = config;
    
    // Create the Gemini model
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    
    // Create chat session with initial history
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: this.getInitialModelResponse(mode, config),
            },
          ],
        },
      ],
    });
    
    const sessionData = {
      chatSession,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      mode: mode || "chat",
      mongoContext: config.mongoContext || "",
      fileContext: config.fileContext || "",
      messageCount: 0,
    };
    
    this.sessions.set(sessionId, sessionData);
    return sessionData;
  }

  /**
   * Update session context (for new file uploads or mongo data)
   * @param {string} sessionId - Session identifier
   * @param {Object} updates - Context updates
   */
  updateSessionContext(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (updates.mongoContext !== undefined) {
        session.mongoContext = updates.mongoContext;
      }
      if (updates.fileContext !== undefined) {
        session.fileContext = updates.fileContext;
      }
      session.lastUsedAt = Date.now();
      console.log(`📝 Updated context for session: ${sessionId}`);
    }
  }

  /**
   * Increment message count for a session
   * @param {string} sessionId - Session identifier
   */
  incrementMessageCount(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messageCount++;
    }
  }

  /**
   * Delete a specific session
   * @param {string} sessionId - Session identifier
   */
  deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.log(`🗑️  Deleted session: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Session stats
   */
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      messageCount: session.messageCount,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      mode: session.mode,
      hasMongoContext: !!session.mongoContext,
      hasFileContext: !!session.fileContext,
    };
  }

  /**
   * Get initial model response based on mode and context
   * @param {string} mode - Chat mode
   * @param {Object} config - Configuration
   * @returns {string} Initial response
   */
  getInitialModelResponse(mode, config) {
    if (mode === "explain") {
      return "Understood! I've received the racing dataset and I'm ready to provide a comprehensive analysis. I'll examine the data structure, identify key metrics, detect patterns, highlight anomalies, and deliver actionable insights focused on racing performance and strategy.";
    } else if (config.mongoContext || config.fileContext) {
      return "Understood! I've received and analyzed the racing data. I'm ready to help you understand and answer questions about this data. What would you like to know?";
    } else {
      return "Understood! I'm here to help with all things Toyota Gazoo Racing. Whether it's race results, driver performance, technical data, or general racing questions, I'm ready to assist. What would you like to know?";
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveTime = now - session.lastUsedAt;
      if (inactiveTime > this.sessionTimeout) {
        this.sessions.delete(sessionId);
        cleanedCount++;
        console.log(`🧹 Cleaned up expired session: ${sessionId} (inactive for ${Math.round(inactiveTime / 60000)} minutes)`);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired session(s)`);
    }
    
    console.log(`📊 Active sessions: ${this.sessions.size}`);
  }

  /**
   * Start automatic cleanup timer
   */
  startCleanup() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);
    
    console.log(`✅ Session cleanup started (checking every ${this.cleanupInterval / 60000} minutes)`);
  }

  /**
   * Get total number of active sessions
   * @returns {number} Active session count
   */
  getActiveSessionCount() {
    return this.sessions.size;
  }
}

// Export singleton instance
module.exports = new SessionManager();

