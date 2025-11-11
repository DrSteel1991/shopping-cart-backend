import { ProductVariantInput } from "../types/types";
import { normalizeString } from "../utils/product.utils";

export const validateVariants = (
  variants: ProductVariantInput[] | undefined
): {
  isValid: boolean;
  error?: string;
} => {
  if (!variants || variants.length === 0) {
    return { isValid: true };
  }

  const seenBySku = new Set<string>();
  const seenByCombo = new Set<string>();

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];

    // Normalize size and color (trim strings)
    const size = normalizeString(variant.size);
    const color = normalizeString(variant.color);

    if (!size && !color && !variant.sku) {
      return {
        isValid: false,
        error: `Variant ${
          i + 1
        } must have at least one of: size, color, or sku`,
      };
    }

    if (variant.sku) {
      if (seenBySku.has(variant.sku)) {
        return {
          isValid: false,
          error: `Duplicate SKU: ${variant.sku}`,
        };
      }
      seenBySku.add(variant.sku);
    }

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
