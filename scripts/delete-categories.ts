import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/database";
import { Category } from "../src/models/Category.model";

/**
 * Deletes all categories from the database
 */
const deleteAllCategories = async (): Promise<void> => {
  try {
    await connectDatabase();

    // Count categories before deletion
    const categoryCount = await Category.countDocuments({});
    console.log(`📊 Found ${categoryCount} categories in database`);

    if (categoryCount === 0) {
      console.log("ℹ️  No categories to delete.");
      return;
    }

    // Confirm deletion (in a real scenario, you might want to add a confirmation prompt)
    console.log(`\n🗑️  Deleting all ${categoryCount} categories...`);

    // Delete all categories
    const result = await Category.deleteMany({});

    console.log(`\n✅ Successfully deleted ${result.deletedCount} categories!`);

    // Verify deletion
    const remainingCount = await Category.countDocuments({});
    if (remainingCount === 0) {
      console.log("✅ All categories have been deleted.");
    } else {
      console.log(
        `⚠️  Warning: ${remainingCount} categories still remain in database.`
      );
    }
  } catch (error) {
    console.error("❌ Error deleting categories:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the delete script
deleteAllCategories()
  .then(() => {
    console.log("✨ Deletion completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deletion failed:", error);
    process.exit(1);
  });
