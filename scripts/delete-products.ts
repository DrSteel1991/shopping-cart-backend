import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/database";
import { Product } from "../src/models/Product.model";

/**
 * Deletes all products from the database
 */
const deleteAllProducts = async (): Promise<void> => {
  try {
    await connectDatabase();

    // Count products before deletion
    const productCount = await Product.countDocuments({});
    console.log(`📊 Found ${productCount} products in database`);

    if (productCount === 0) {
      console.log("ℹ️  No products to delete.");
      return;
    }

    // Confirm deletion (in a real scenario, you might want to add a confirmation prompt)
    console.log(`\n🗑️  Deleting all ${productCount} products...`);

    // Delete all products
    const result = await Product.deleteMany({});

    console.log(`\n✅ Successfully deleted ${result.deletedCount} products!`);

    // Verify deletion
    const remainingCount = await Product.countDocuments({});
    if (remainingCount === 0) {
      console.log("✅ All products have been deleted.");
    } else {
      console.log(
        `⚠️  Warning: ${remainingCount} products still remain in database.`
      );
    }
  } catch (error) {
    console.error("❌ Error deleting products:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the delete script
deleteAllProducts()
  .then(() => {
    console.log("✨ Deletion completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deletion failed:", error);
    process.exit(1);
  });
