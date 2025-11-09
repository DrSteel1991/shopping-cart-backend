import mongoose, { Schema } from "mongoose";

/**
 * Product Schema
 * Products belong to a Category (can be top-level category or subcategory)
 *
 * Example:
 * - Product: { name: "iPhone", category: <apple_subcategory_id> }
 *
 * Note: Products typically belong to subcategories, but can reference any category
 */
const productSchema = new Schema(
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
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, slug: 1 });

export const Product = mongoose.model("Product", productSchema);
