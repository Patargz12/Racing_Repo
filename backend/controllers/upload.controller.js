const uploadModel = require("../models/upload.model");

class UploadController {
  /**
   * Handle file upload to MongoDB
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadToMongoDB(req, res) {
    try {
      const { data, collectionName } = req.body;

      // Validate data
      const dataValidation = uploadModel.validateData(data);
      if (!dataValidation.isValid) {
        return res.status(400).json({ error: dataValidation.error });
      }

      // Validate collection name
      const collectionValidation =
        uploadModel.validateCollectionName(collectionName);
      if (!collectionValidation.isValid) {
        return res.status(400).json({ error: collectionValidation.error });
      }

      const sanitizedCollectionName = collectionValidation.sanitizedName;

      // Insert documents into MongoDB
      const result = await uploadModel.insertDocuments(
        data,
        sanitizedCollectionName
      );

      // Send success response
      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${result.insertedCount} documents to collection '${sanitizedCollectionName}'`,
        insertedCount: result.insertedCount,
        collectionName: sanitizedCollectionName,
      });
    } catch (error) {
      console.error("MongoDB upload error:", error);
      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload to MongoDB",
      });
    }
  }

  /**
   * Health check endpoint handler
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  /**
   * Health check endpoint for monitoring
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async healthCheck(req, res) {
    try {
      const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      };

      // Check MongoDB connection if URI is available
      if (process.env.MONGODB_URI) {
        try {
          const { MongoClient } = require('mongodb');
          const client = new MongoClient(process.env.MONGODB_URI);
          await client.connect();
          const db = client.db("excel_converter");
          const collections = await db.listCollections().toArray();
          health.mongodb = "connected";
          health.collections = collections.length;
          await client.close();
        } catch (dbError) {
          health.mongodb = "error";
          health.mongodbError = dbError.message;
        }
      } else {
        health.mongodb = "not configured";
      }

      res.status(200).json(health);
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new UploadController();
