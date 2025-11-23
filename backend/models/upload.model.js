const { MongoClient } = require("mongodb");

class UploadModel {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.databaseName = "excel_converter";
    this.registryCollectionName = "_collection_registry";
  }

  /**
   * Validate the collection name according to MongoDB naming rules
   * @param {string} collectionName - The name of the collection
   * @returns {Object} - Validation result with isValid and error message
   */
  validateCollectionName(collectionName) {
    if (
      !collectionName ||
      typeof collectionName !== "string" ||
      collectionName.trim() === ""
    ) {
      return {
        isValid: false,
        error: "Collection name is required",
      };
    }

    const sanitizedName = collectionName.trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sanitizedName)) {
      return {
        isValid: false,
        error:
          "Invalid collection name. Must start with a letter or underscore and contain only alphanumeric characters and underscores",
      };
    }

    return {
      isValid: true,
      sanitizedName,
    };
  }

  /**
   * Validate the data array
   * @param {Array} data - The data to validate
   * @returns {Object} - Validation result
   */
  validateData(data) {
    if (!data || !Array.isArray(data)) {
      return {
        isValid: false,
        error: "Invalid data format",
      };
    }

    if (data.length === 0) {
      return {
        isValid: false,
        error: "Data array is empty",
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Add metadata to documents
   * @param {Array} data - Array of documents
   * @returns {Array} - Documents with added metadata
   */
  prepareDocuments(data) {
    return data.map((doc) => ({
      ...doc,
      uploadedAt: new Date(),
    }));
  }

  /**
   * Extract keywords from collection name for semantic matching
   * @param {string} collectionName - Name of the collection
   * @returns {Array} - Array of keywords
   */
  extractKeywords(collectionName) {
    // Split by underscores, hyphens, and spaces
    const words = collectionName
      .toLowerCase()
      .split(/[_\s-]/)
      .filter((word) => word.length > 2); // Only keep words longer than 2 chars

    return words;
  }

  /**
   * Detect data type based on column names
   * @param {Array} columns - Array of column names
   * @returns {string} - Detected data type
   */
  detectDataType(columns) {
    const columnSet = new Set(columns.map((col) => col.toLowerCase()));

    // Check for results/standings data
    if (
      columnSet.has("pos") ||
      columnSet.has("position") ||
      columnSet.has("classified")
    ) {
      return "results";
    }

    // Check for lap time data
    if (
      (columnSet.has("lap") || columnSet.has("laps")) &&
      (columnSet.has("time") || columnSet.has("laptime"))
    ) {
      return "lap_times";
    }

    // Check for weather data
    if (
      columnSet.has("weather") ||
      columnSet.has("temp") ||
      columnSet.has("temperature") ||
      columnSet.has("humidity")
    ) {
      return "weather";
    }

    // Check for analysis data
    if (
      columnSet.has("analysis") ||
      columnSet.has("section") ||
      columnSet.has("endurance")
    ) {
      return "analysis";
    }

    return "general";
  }

  /**
   * Register collection in the metadata registry
   * @param {string} collectionName - Name of the collection
   * @param {Array} data - Sample data from the collection
   * @param {MongoClient} client - MongoDB client (reused from main transaction)
   */
  async registerCollection(collectionName, data, client) {
    try {
      const database = client.db(this.databaseName);
      const registry = database.collection(this.registryCollectionName);

      // Extract metadata
      const keywords = this.extractKeywords(collectionName);
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      const dataType = this.detectDataType(columns);

      // Create registry entry
      const registryEntry = {
        collectionName,
        keywords,
        dataType,
        columns: columns.filter((col) => col !== "_id"), // Exclude MongoDB internal fields
        recordCount: data.length,
        uploadedAt: new Date(),
        lastUpdated: new Date(),
      };

      // Upsert into registry (update if exists, insert if not)
      await registry.updateOne(
        { collectionName },
        { $set: registryEntry },
        { upsert: true }
      );

      console.log(
        `✅ Registered collection "${collectionName}" in registry with keywords: [${keywords.join(
          ", "
        )}]`
      );
    } catch (error) {
      console.error(
        `⚠️  Failed to register collection "${collectionName}":`,
        error.message
      );
      // Don't throw - registry is optional, main upload should still succeed
    }
  }

  /**
   * Insert documents into MongoDB collection
   * @param {Array} data - Array of documents to insert
   * @param {string} collectionName - Name of the collection
   * @returns {Object} - Result of the insert operation
   */
  async insertDocuments(data, collectionName) {
    if (!this.mongoUri) {
      throw new Error("MongoDB URI not configured");
    }

    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();

      const database = client.db(this.databaseName);
      const collection = database.collection(collectionName);

      // Prepare documents with metadata
      const documentsWithMetadata = this.prepareDocuments(data);

      // Insert documents
      const result = await collection.insertMany(documentsWithMetadata);

      // Register collection in metadata registry
      await this.registerCollection(collectionName, data, client);

      return {
        insertedCount: result.insertedCount,
        insertedIds: result.insertedIds,
      };
    } finally {
      await client.close();
    }
  }
}

module.exports = new UploadModel();
