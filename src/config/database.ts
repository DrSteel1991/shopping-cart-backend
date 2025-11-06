import mongoose from "mongoose";

// Database name from environment variable or default
const DB_NAME = process.env.DB_NAME || "shoppingCartDB";

// Base cluster connection string (without database name)
const CLUSTER_URI =
  "mongodb+srv://anthonyalhelou_db_user:iQHtZPebKNeMaTbc@shoppingcartcluster.xkzxlup.mongodb.net";

// Construct full connection string with database name
// Format: mongodb+srv://...@cluster.mongodb.net/databaseName?options
const getConnectionString = (): string => {
  // If MONGO_URI is provided in env, use it directly (should include DB name)
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  // Otherwise, construct it with the database name
  // Insert database name before the query parameters
  return `${CLUSTER_URI}/${DB_NAME}?appName=shoppingCartCluster`;
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const connectionString = getConnectionString();
    await mongoose.connect(connectionString, {
      dbName: DB_NAME, // Explicitly specify database name (overrides URI if present)
    });
    console.log(`✅ Connected to MongoDB database: ${DB_NAME}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error);
});
