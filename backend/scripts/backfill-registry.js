const { MongoClient } = require("mongodb");
const path = require("path");

// Load .env from the backend directory
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

/**
 * Backfill script to register existing collections in the metadata registry
 * This ensures that collections created before the registry system are also discoverable
 */

class RegistryBackfill {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.databaseName = "excel_converter";
    this.registryCollectionName = "_collection_registry";

    // Mapping of existing collections with their metadata
    this.existingCollections = [
      {
        collectionName: "Provisional_Results_Race_1",
        keywords: ["provisional", "results", "race"],
        dataType: "results",
      },
      {
        collectionName: "Provisional_Results_Class_Race_01",
        keywords: ["provisional", "results", "class", "race"],
        dataType: "results",
      },
      {
        collectionName: "Results_GR_Cup_Race_01",
        keywords: ["results", "gr", "cup", "race"],
        dataType: "results",
      },
      {
        collectionName: "Results_By_Class_GR_CUP_Race_01",
        keywords: ["results", "class", "gr", "cup", "race"],
        dataType: "results",
      },
      {
        collectionName: "Best_Laps_Race_1",
        keywords: ["best", "laps", "race"],
        dataType: "lap_times",
      },
      {
        collectionName: "Best_10_Laps_By_Driver_1",
        keywords: ["best", "laps", "driver"],
        dataType: "lap_times",
      },
      {
        collectionName: "Lap_Time_Race_1",
        keywords: ["lap", "time", "race"],
        dataType: "lap_times",
      },
      {
        collectionName: "road_america_lap_time_R1",
        keywords: ["road", "america", "lap", "time"],
        dataType: "lap_times",
      },
      {
        collectionName: "road_america_lap_start_R1",
        keywords: ["road", "america", "lap", "start"],
        dataType: "lap_times",
      },
      {
        collectionName: "road_america_lap_end_R1",
        keywords: ["road", "america", "lap", "end"],
        dataType: "lap_times",
      },
      {
        collectionName: "Weather_Race_1",
        keywords: ["weather", "race"],
        dataType: "weather",
      },
      {
        collectionName: "Analysis_Endurance",
        keywords: ["analysis", "endurance"],
        dataType: "analysis",
      },
      {
        collectionName: "Analysis_Endurance_With_Sections",
        keywords: ["analysis", "endurance", "sections"],
        dataType: "analysis",
      },
    ];
  }

  async backfill() {
    if (!this.mongoUri) {
      console.error("❌ MongoDB URI not configured");
      return;
    }

    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      console.log("✅ Connected to MongoDB");

      const database = client.db(this.databaseName);
      const registry = database.collection(this.registryCollectionName);

      let registeredCount = 0;
      let skippedCount = 0;

      for (const collectionMeta of this.existingCollections) {
        try {
          // Check if collection exists
          const collections = await database
            .listCollections({ name: collectionMeta.collectionName })
            .toArray();

          if (collections.length === 0) {
            console.log(
              `⏭️  Skipping "${collectionMeta.collectionName}" (collection doesn't exist)`
            );
            skippedCount++;
            continue;
          }

          // Get collection info
          const collection = database.collection(collectionMeta.collectionName);
          const recordCount = await collection.countDocuments();
          const sampleDoc = await collection.findOne();

          const columns = sampleDoc
            ? Object.keys(sampleDoc).filter((col) => col !== "_id")
            : [];

          // Create registry entry
          const registryEntry = {
            collectionName: collectionMeta.collectionName,
            keywords: collectionMeta.keywords,
            dataType: collectionMeta.dataType,
            columns,
            recordCount,
            uploadedAt: new Date(), // Use current date for backfill
            lastUpdated: new Date(),
            backfilled: true, // Mark as backfilled
          };

          // Upsert into registry
          await registry.updateOne(
            { collectionName: collectionMeta.collectionName },
            { $set: registryEntry },
            { upsert: true }
          );

          console.log(
            `✅ Registered "${collectionMeta.collectionName}" (${recordCount} records)`
          );
          registeredCount++;
        } catch (error) {
          console.error(
            `❌ Failed to register "${collectionMeta.collectionName}":`,
            error.message
          );
        }
      }

      console.log("\n=== Backfill Complete ===");
      console.log(`✅ Registered: ${registeredCount} collection(s)`);
      console.log(`⏭️  Skipped: ${skippedCount} collection(s)`);
    } catch (error) {
      console.error("❌ Backfill error:", error);
    } finally {
      await client.close();
      console.log("👋 Disconnected from MongoDB");
    }
  }
}

// Run backfill
const backfill = new RegistryBackfill();
backfill.backfill();
