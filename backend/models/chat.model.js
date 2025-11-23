const { MongoClient } = require("mongodb");

/**
 * Chat Model for RAG (Retrieval-Augmented Generation) Chatbot
 * Queries MongoDB for relevant racing data based on user questions
 */
class ChatModel {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.databaseName = "excel_converter";
    this.registryCollectionName = "_collection_registry";

    // Define collection mappings for different data types
    // This is kept for backward compatibility with existing collections
    this.collectionMap = {
      // Results and Standings
      provisionalResults1: "Provisional_Results_Race_1",
      provisionalResultsClass01: "Provisional_Results_Class_Race_01",
      resultsGRCup01: "Results_GR_Cup_Race_01",
      resultsByClassGRCup01: "Results_By_Class_GR_CUP_Race_01",

      // Lap Times and Performance
      bestLaps1: "Best_Laps_Race_1",
      best10LapsByDriver1: "Best_10_Laps_By_Driver_1",
      lapTime1: "Lap_Time_Race_1",
      roadAmericaLapTimeR1: "road_america_lap_time_R1",
      roadAmericaLapStartR1: "road_america_lap_start_R1",
      roadAmericaLapEndR1: "road_america_lap_end_R1",

      // Weather
      weather1: "Weather_Race_1",

      // Analysis
      analysis: "Analysis_Endurance",
      analysisWithSections: "Analysis_Endurance_With_Sections",
    };
  }

  /**
   * Fetch all registered collections from the metadata registry
   * @param {MongoClient} client - MongoDB client
   * @returns {Array} - Array of registry entries
   */
  async getRegisteredCollections(client) {
    try {
      const database = client.db(this.databaseName);
      const registry = database.collection(this.registryCollectionName);

      // Fetch all registry entries
      const registeredCollections = await registry.find({}).toArray();

      return registeredCollections;
    } catch (error) {
      console.log(
        "⚠️  Could not fetch registry (might not exist yet):",
        error.message
      );
      return [];
    }
  }

  /**
   * Find relevant collections based on question keywords
   * Combines static collection map with dynamic registry
   * @param {string} question - User's question
   * @param {Array} registeredCollections - Collections from registry
   * @returns {Array} - Array of collection names to query
   */
  findRelevantCollectionsFromRegistry(question, registeredCollections) {
    const lowerQuestion = question.toLowerCase();
    const matches = [];

    // Match against registered collections
    for (const regEntry of registeredCollections) {
      // Check if any keyword from the collection matches the question
      const keywordMatch = regEntry.keywords.some((keyword) =>
        lowerQuestion.includes(keyword)
      );

      if (keywordMatch) {
        matches.push({
          collectionName: regEntry.collectionName,
          dataType: regEntry.dataType,
          score: 1, // Could be enhanced with better scoring
        });
        console.log(
          `🎯 Registry match: "${
            regEntry.collectionName
          }" (keywords: ${regEntry.keywords.join(", ")})`
        );
      }
    }

    return matches;
  }

  /**
   * Analyze the user's question to determine intent and relevant collections
   * @param {string} question - User's question
   * @param {Array} registeredCollections - Collections from registry (optional)
   * @returns {Object} Analysis result with intent, collections to query, and filters
   */
  analyzeQuestionIntent(question, registeredCollections = []) {
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

    // PRIORITY 1: Check registry for dynamically uploaded collections
    if (registeredCollections.length > 0) {
      const registryMatches = this.findRelevantCollectionsFromRegistry(
        question,
        registeredCollections
      );

      if (registryMatches.length > 0) {
        // Add registry matches to collections to query
        registryMatches.forEach((match) => {
          if (!collectionsToQuery.includes(match.collectionName)) {
            collectionsToQuery.push(match.collectionName);
            console.log(
              `✅ Added from registry: ${match.collectionName} (type: ${match.dataType})`
            );
          }
        });
      }
    }

    // PRIORITY 2: Static collection matching (backward compatibility)

    // Explicit collection name detection (when users mention specific collection names)
    const collectionNameMap = {
      results_gr_cup_race_01: "resultsGRCup01",
      "results gr cup": "resultsGRCup01",
      provisional_results_race_1: "provisionalResults1",
      "provisional results": "provisionalResults1",
      best_10_laps_by_driver: "best10LapsByDriver1",
      "best 10 laps by driver": "best10LapsByDriver1",
      results_by_class: "resultsByClassGRCup01",
      provisional_results_class: "provisionalResultsClass01",
      weather_race_1: "weather1",
      analysis_endurance: "analysis",
      analysis_endurance_with_sections: "analysisWithSections",
      road_america: "roadAmericaLapTimeR1",
    };

    // Check if user explicitly mentioned a collection name
    for (const [pattern, collectionKey] of Object.entries(collectionNameMap)) {
      if (lowerQuestion.includes(pattern)) {
        if (!collectionsToQuery.includes(collectionKey)) {
          collectionsToQuery.push(collectionKey);
          console.log(
            `🎯 Detected explicit collection mention: ${pattern} → ${collectionKey}`
          );
        }
      }
    }

    // Best 10 laps by driver keywords (specific collection)
    if (
      /best\s*(10|ten)?\s*laps?\s*(by\s*driver|driver)/i.test(lowerQuestion)
    ) {
      if (!collectionsToQuery.includes("best10LapsByDriver1")) {
        collectionsToQuery.push("best10LapsByDriver1");
      }
    }

    // Position/Results keywords
    if (
      /position|standing|result|winner|ranking|place|pos|classified/i.test(
        lowerQuestion
      )
    ) {
      ["provisionalResults1", "resultsGRCup01"].forEach((col) => {
        if (!collectionsToQuery.includes(col)) collectionsToQuery.push(col);
      });
    }

    // Results by class keywords
    if (/class|gr\s*cup|division/i.test(lowerQuestion)) {
      ["resultsByClassGRCup01", "provisionalResultsClass01"].forEach((col) => {
        if (!collectionsToQuery.includes(col)) collectionsToQuery.push(col);
      });
    }

    // Lap time keywords
    if (/lap|time|fastest|slowest|best lap|lap time/i.test(lowerQuestion)) {
      ["bestLaps1", "lapTime1"].forEach((col) => {
        if (!collectionsToQuery.includes(col)) collectionsToQuery.push(col);
      });
    }

    // Road America specific data
    if (/road\s*america|lap\s*start|lap\s*end/i.test(lowerQuestion)) {
      [
        "roadAmericaLapTimeR1",
        "roadAmericaLapStartR1",
        "roadAmericaLapEndR1",
      ].forEach((col) => {
        if (!collectionsToQuery.includes(col)) collectionsToQuery.push(col);
      });
    }

    // Weather keywords
    if (
      /weather|temperature|rain|wind|condition|humidity|pressure/i.test(
        lowerQuestion
      )
    ) {
      if (!collectionsToQuery.includes("weather1")) {
        collectionsToQuery.push("weather1");
      }
    }

    // Analysis keywords
    if (/analysis|endurance|performance|section/i.test(lowerQuestion)) {
      ["analysis", "analysisWithSections"].forEach((col) => {
        if (!collectionsToQuery.includes(col)) collectionsToQuery.push(col);
      });
    }

    // If no specific collections identified, query results as default
    if (collectionsToQuery.length === 0) {
      collectionsToQuery.push("provisionalResults1", "resultsGRCup01");
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
      await client.connect();
      const database = client.db(this.databaseName);

      // Fetch registered collections from registry
      const registeredCollections = await this.getRegisteredCollections(client);

      console.log(
        `📋 Found ${registeredCollections.length} registered collection(s) in registry`
      );

      // Analyze the question to determine what to query
      const analysis = this.analyzeQuestionIntent(
        question,
        registeredCollections
      );

      const results = {};
      let hasData = false;

      // Query each relevant collection
      for (const collectionKey of analysis.collectionsToQuery) {
        // Check if this is a static collection key or a direct collection name
        let collectionName;

        if (this.collectionMap[collectionKey]) {
          // Static collection from collectionMap
          collectionName = this.collectionMap[collectionKey];
        } else {
          // Direct collection name from registry
          collectionName = collectionKey;
        }

        if (!collectionName) {
          console.log(`⚠️  Collection mapping not found for: ${collectionKey}`);
          continue;
        }

        try {
          const collection = database.collection(collectionName);

          // Build query based on filters
          const query = {};
          if (analysis.filters.POS) {
            // Some collections use POS, others use POSITION
            query.$or = [
              { POS: analysis.filters.POS },
              { POSITION: analysis.filters.POS },
            ];
          }
          if (analysis.filters.NUMBER) {
            query.NUMBER = analysis.filters.NUMBER;
          }

          // Determine limit
          const limit = analysis.filters.limit || 10;

          // Execute query with sorting (if applicable)
          let cursor = collection.find(query).limit(limit);

          // Sort based on collection type
          // For static collections, use existing logic
          if (
            collectionKey === "provisionalResults1" ||
            collectionKey === "resultsGRCup01" ||
            collectionKey === "provisionalResultsClass01" ||
            collectionKey === "resultsByClassGRCup01"
          ) {
            cursor = cursor.sort({ POS: 1, POSITION: 1 });
          } else if (collectionKey === "best10LapsByDriver1") {
            cursor = cursor.sort({ NUMBER: 1 });
          } else if (
            collectionKey === "bestLaps1" ||
            collectionKey === "lapTime1" ||
            collectionKey === "roadAmericaLapTimeR1"
          ) {
            cursor = cursor.sort({ TIME: 1 });
          } else if (
            collectionKey === "roadAmericaLapStartR1" ||
            collectionKey === "roadAmericaLapEndR1"
          ) {
            cursor = cursor.sort({ timestamp: 1 });
          } else {
            // For dynamic collections from registry, use intelligent sorting
            const registryEntry = registeredCollections.find(
              (r) => r.collectionName === collectionName
            );

            if (registryEntry) {
              // Sort based on data type
              if (registryEntry.dataType === "results") {
                cursor = cursor.sort({ POS: 1, POSITION: 1 });
              } else if (registryEntry.dataType === "lap_times") {
                cursor = cursor.sort({ TIME: 1, LAP: 1 });
              } else if (registryEntry.columns.includes("timestamp")) {
                cursor = cursor.sort({ timestamp: 1 });
              }
            }
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
