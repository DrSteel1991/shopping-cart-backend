import mongoose, { Schema, Document } from "mongoose";
import { ProductVariant } from "../types/types";

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
    // Product variants - each variant has a single size and/or color
    // Examples:
    // - iPhone variant: { size: "256GB", color: "black", stock: 10 }
    // - Desk Chair variant: { size: "Large", color: "black", stock: 5 }
    // - Simple product: variants: []
    variants: [
      {
        // Size (e.g., "256GB" or "Small")
        size: {
          type: String,
          trim: true,
        },
        // Color (e.g., "black" or "red")
        color: {
          type: String,
          trim: true,
        },
        // Variant name/label (e.g., "256GB Black", "Large Black Chair")
        // Useful for display purposes
        name: {
          type: String,
          trim: true,
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
        },
        // Optional price override for this variant (if different from base price)
        price: {
          type: Number,
          min: 0,
        },
        // Whether this variant is available for purchase
        available: {
          type: Boolean,
          default: true,
        },
        // SKU for this specific variant
        sku: {
          type: String,
          trim: true,
          unique: true,
          sparse: true, // Allows multiple null values
        },
      },
    ],
    // Legacy stock field (deprecated, use variants instead)
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
productSchema.index({ "variants.sku": 1 });

// Method to check if a variant is available for a specific size and color
// Supports matching by size, color, both, SKU, or variantId
productSchema.methods.isVariantAvailable = function (
  options: {
    size?: string;
    color?: string;
    sku?: string;
    variantId?: string;
  },
  quantity: number = 1
): boolean {
  let variant;

  if (options.sku) {
    variant = this.variants.find(
      (v: Document & ProductVariant) => v.sku === options.sku
    );
  } else if (options.variantId) {
    variant = this.variants.id(options.variantId);
  } else {
    // Match by size and/or color (exact string match)
    variant = this.variants.find((v: Document & ProductVariant) => {
      const sizeMatch = !options.size || (v.size && v.size === options.size);
      const colorMatch =
        !options.color || (v.color && v.color === options.color);
      return sizeMatch && colorMatch;
    });
  }

  return variant && variant.available && variant.stock >= quantity;
};

// Method to get variant by size, color, SKU, or variantId
productSchema.methods.getVariant = function (options: {
  size?: string;
  color?: string;
  sku?: string;
  variantId?: string;
}) {
  if (options.sku) {
    return this.variants.find(
      (v: Document & ProductVariant) => v.sku === options.sku
    );
  }
  if (options.variantId) {
    return this.variants.id(options.variantId);
  }
  // Match by size and/or color (exact string match)
  return this.variants.find((v: Document & ProductVariant) => {
    const sizeMatch = !options.size || (v.size && v.size === options.size);
    const colorMatch = !options.color || (v.color && v.color === options.color);
    return sizeMatch && colorMatch;
  });
};

export const Product = mongoose.model("Product", productSchema);
