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
  healthCheck(req, res) {
    res.json({ status: "ok", message: "Express server is running" });
  }
}

module.exports = new UploadController();
