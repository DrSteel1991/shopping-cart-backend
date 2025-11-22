import mongoose from "mongoose";

// Database name from environment variable or default
const DB_NAME = process.env.DB_NAME || "shoppingCartDB";

// Construct full connection string with database name
// Format: mongodb+srv://...@cluster.mongodb.net/databaseName?options
const getConnectionString = (): string => {
  // MONGO_URI must be provided in environment variables
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is required in environment variables. Please set it in your .env file."
    );
  }

  return process.env.MONGO_URI;
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
