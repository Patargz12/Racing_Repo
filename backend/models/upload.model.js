const { MongoClient } = require("mongodb");

class UploadModel {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.databaseName = "excel_converter";
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
