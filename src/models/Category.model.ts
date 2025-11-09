import mongoose, { Schema } from "mongoose";

/**
 * Category Schema
 * Supports hierarchical categories:
 * - Top-level category: parent = null (e.g., "phones")
 * - Subcategory: parent = Category ID (e.g., "apple" under "phones")
 *
 * Example structure:
 * - Category: { name: "phones", parent: null }
 * - Subcategory: { name: "apple", parent: <phones_id> }
 */
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Reference to parent category (null for top-level categories)
    // If parent exists, this is a subcategory
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient queries on parent
categorySchema.index({ parent: 1 });

// Virtual to check if category is a subcategory
categorySchema.virtual("isSubcategory").get(function () {
  return this.parent !== null;
});

export const Category = mongoose.model("Category", categorySchema);
