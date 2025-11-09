import { ProductVariantInput } from "../types/types";
import { normalizeString } from "../utils/product.utils";

/**
 * Validates product variants (flexible - supports any size/color combinations)
 * Provides business logic validation that Mongoose schema doesn't handle:
 * - Duplicate SKU detection
 * - Duplicate size+color combination detection
 * - Better error messages
 *
 * @param variants - Array of variant objects to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateVariants = (
  variants: ProductVariantInput[] | undefined
): {
  isValid: boolean;
  error?: string;
} => {
  // Variants are optional - products can have no variants (simple products)
  if (!variants || variants.length === 0) {
    return { isValid: true }; // Empty variants array is valid
  }

  // Check for duplicate variants
  // Duplicates are determined by: SKU (if provided), or size+color combination
  const seenBySku = new Set<string>();
  const seenByCombo = new Set<string>();

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];

    // Normalize size and color (trim strings)
    const size = normalizeString(variant.size);
    const color = normalizeString(variant.color);

    // At least one of size, color, or SKU should be provided
    if (!size && !color && !variant.sku) {
      return {
        isValid: false,
        error: `Variant ${
          i + 1
        } must have at least one of: size, color, or sku`,
      };
    }

    // Check for duplicate SKU
    if (variant.sku) {
      if (seenBySku.has(variant.sku)) {
        return {
          isValid: false,
          error: `Duplicate SKU: ${variant.sku}`,
        };
      }
      seenBySku.add(variant.sku);
    }

    // Check for duplicate size+color combination (if both are provided)
    if (size && color) {
      const comboKey = `${size}|${color}`;
      if (seenByCombo.has(comboKey)) {
        return {
          isValid: false,
          error: `Duplicate variant with size "${size}" and color "${color}"`,
        };
      }
      seenByCombo.add(comboKey);
    }

    // Validate stock
    if (typeof variant.stock !== "number" || variant.stock < 0) {
      const variantLabel =
        variant.name ||
        (size && color
          ? `size "${size}" color "${color}"`
          : size
          ? `size "${size}"`
          : color
          ? `color "${color}"`
          : variant.sku || `variant ${i + 1}`);
      return {
        isValid: false,
        error: `Invalid stock value for ${variantLabel}. Stock must be a non-negative number`,
      };
    }

    // Validate price if provided
    if (
      variant.price !== undefined &&
      (typeof variant.price !== "number" || variant.price < 0)
    ) {
      const variantLabel =
        variant.name ||
        (size && color
          ? `size "${size}" color "${color}"`
          : size
          ? `size "${size}"`
          : color
          ? `color "${color}"`
          : variant.sku || `variant ${i + 1}`);
      return {
        isValid: false,
        error: `Invalid price for ${variantLabel}. Price must be a non-negative number`,
      };
    }

    // Validate available flag
    if (
      variant.available !== undefined &&
      typeof variant.available !== "boolean"
    ) {
      return {
        isValid: false,
        error: `Invalid available flag for variant ${i + 1}. Must be a boolean`,
      };
    }
  }

  return { isValid: true };
};
