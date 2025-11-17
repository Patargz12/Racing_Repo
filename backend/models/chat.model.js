const { MongoClient } = require("mongodb");

/**
 * Chat Model for RAG (Retrieval-Augmented Generation) Chatbot
 * Queries MongoDB for relevant racing data based on user questions
 */
class ChatModel {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.databaseName = "excel_converter";

    // Define collection mappings for different data types
    this.collectionMap = {
      provisionalResults1: "Provisional_Results_Race_1",
      bestLaps1: "Best_Laps_Race_1",
      lapTime1: "Lap_Time_Race_1",
      weather1: "Weather_Race_1",
      analysis: "Analysis_Endurance",
      // Add more collections as needed
    };
  }

  /**
   * Analyze the user's question to determine intent and relevant collections
   * @param {string} question - User's question
   * @returns {Object} Analysis result with intent, collections to query, and filters
   */
  analyzeQuestionIntent(question) {
    const lowerQuestion = question.toLowerCase();

    // Define intent patterns
    const intents = {
      identify_entity: [
        /who (is|was|are)/i,
        /which (driver|vehicle|team)/i,
        /who won/i,
        /winner/i,
      ],
      find_extreme: [
        /fastest/i,
        /slowest/i,
        /best/i,
        /worst/i,
        /highest/i,
        /lowest/i,
        /maximum/i,
        /minimum/i,
      ],
      environmental: [
        /weather/i,
        /temperature/i,
        /rain/i,
        /wind/i,
        /conditions/i,
      ],
      analysis: [
        /analysis/i,
        /endurance/i,
        /performance/i,
        /statistics/i,
        /trends/i,
      ],
      general_query: [/.*/], // Default catch-all
    };

    // Determine intent
    let detectedIntent = "general_query";
    for (const [intent, patterns] of Object.entries(intents)) {
      if (patterns.some((pattern) => pattern.test(lowerQuestion))) {
        detectedIntent = intent;
        break;
      }
    }

    // Determine which collections to query based on keywords
    const collectionsToQuery = [];

    // Position/Results keywords
    if (
      /position|standing|result|winner|ranking|place|pos/i.test(lowerQuestion)
    ) {
      collectionsToQuery.push("provisionalResults1");
    }

    // Lap time keywords
    if (/lap|time|fastest|slowest|best lap|lap time/i.test(lowerQuestion)) {
      collectionsToQuery.push("bestLaps1", "lapTime1");
    }

    // Weather keywords
    if (/weather|temperature|rain|wind|condition/i.test(lowerQuestion)) {
      collectionsToQuery.push("weather1");
    }

    // Analysis keywords
    if (/analysis|endurance|performance/i.test(lowerQuestion)) {
      collectionsToQuery.push("analysis");
    }

    // If no specific collections identified, query results as default
    if (collectionsToQuery.length === 0) {
      collectionsToQuery.push("provisionalResults1");
    }

    // Extract filters from the question
    const filters = {};

    // Extract position number
    const posMatch = lowerQuestion.match(/position\s+(\d+)/i);
    if (posMatch) {
      filters.POS = parseInt(posMatch[1]);
    }

    // Extract vehicle number
    const vehicleMatch = lowerQuestion.match(
      /(?:vehicle|car|number)\s+(?:number\s+)?(\d+)/i
    );
    if (vehicleMatch) {
      filters.NUMBER = parseInt(vehicleMatch[1]);
    }

    // Extract limit for "top N" queries
    const topMatch = lowerQuestion.match(/(?:top|best|first)\s+(\d+)/i);
    if (topMatch) {
      filters.limit = parseInt(topMatch[1]);
    }

    return {
      intent: detectedIntent,
      collectionsToQuery,
      filters,
    };
  }

  /**
   * Query MongoDB for race data based on the user's question
   * @param {string} question - User's question
   * @returns {Object} Query results with data from relevant collections
   */
  async queryRaceData(question) {
    if (!this.mongoUri) {
      return {
        hasData: false,
        results: {},
        error: "MongoDB URI not configured",
      };
    }

    const client = new MongoClient(this.mongoUri);

    try {
      // Analyze the question to determine what to query
      const analysis = this.analyzeQuestionIntent(question);

      await client.connect();
      const database = client.db(this.databaseName);

      const results = {};
      let hasData = false;

      // Query each relevant collection
      for (const collectionKey of analysis.collectionsToQuery) {
        const collectionName = this.collectionMap[collectionKey];

        if (!collectionName) {
          console.log(`⚠️  Collection mapping not found for: ${collectionKey}`);
          continue;
        }

        try {
          const collection = database.collection(collectionName);

          // Build query based on filters
          const query = {};
          if (analysis.filters.POS) {
            query.POS = analysis.filters.POS;
          }
          if (analysis.filters.NUMBER) {
            query.NUMBER = analysis.filters.NUMBER;
          }

          // Determine limit
          const limit = analysis.filters.limit || 10;

          // Execute query with sorting (if applicable)
          let cursor = collection.find(query).limit(limit);

          // Sort by position for results, by time for laps
          if (collectionKey === "provisionalResults1") {
            cursor = cursor.sort({ POS: 1 });
          } else if (
            collectionKey === "bestLaps1" ||
            collectionKey === "lapTime1"
          ) {
            cursor = cursor.sort({ TIME: 1 });
          }

          const data = await cursor.toArray();

          if (data.length > 0) {
            results[collectionKey] = {
              collectionName,
              count: data.length,
              data,
            };
            hasData = true;
          }
        } catch (collectionError) {
          console.error(
            `⚠️  Error querying collection ${collectionName}:`,
            collectionError.message
          );
          // Continue with other collections
        }
      }

      return {
        hasData,
        results,
        analysis,
      };
    } finally {
      await client.close();
    }
  }

  /**
   * Format query results into context for Gemini AI
   * @param {Object} queryResults - Results from queryRaceData
   * @returns {string} Formatted context string
   */
  formatContextForGemini(queryResults) {
    if (!queryResults.hasData) {
      return "";
    }

    let context = "📊 RACING DATA FROM DATABASE:\n\n";

    for (const [key, result] of Object.entries(queryResults.results)) {
      context += `\n=== ${result.collectionName} (${result.count} records) ===\n`;

      // Format each record
      result.data.forEach((record, index) => {
        context += `\nRecord ${index + 1}:\n`;

        // Format key-value pairs
        for (const [field, value] of Object.entries(record)) {
          // Skip MongoDB internal fields
          if (field === "_id" || field === "uploadedAt") {
            continue;
          }

          context += `  ${field}: ${value}\n`;
        }
      });

      context += "\n";
    }

    context += "\n=== END OF DATABASE DATA ===\n\n";
    context +=
      "Please use this data to answer the user's question accurately. Reference specific values when relevant.\n";

    return context;
  }
}

module.exports = new ChatModel();
