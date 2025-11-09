import { ProductVariantInput } from "../types/types";

/**
 * Normalizes a size or color value (string) by trimming whitespace
 * - If it's undefined/null, returns undefined
 * - If it's a string, trims it and returns empty string if result is empty
 *
 * @param value - The size or color value to normalize (string | undefined)
 * @returns Normalized string or undefined
 */
export const normalizeString = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
};

/**
 * Normalizes a product variant input to ensure size and color are trimmed strings
 * This is used when creating or updating products
 *
 * @param variant - The variant input to normalize
 * @returns Normalized variant with size and color as trimmed strings
 */
export const normalizeVariant = (variant: ProductVariantInput) => {
  return {
    size: normalizeString(variant.size),
    color: normalizeString(variant.color),
    name: variant.name?.trim(),
    stock: variant.stock || 0,
    price: variant.price,
    available: variant.available !== undefined ? variant.available : true,
    sku: variant.sku?.trim(),
  };
};

/**
 * Normalizes an array of product variant inputs
 *
 * @param variants - Array of variant inputs to normalize
 * @returns Array of normalized variants
 */
export const normalizeVariants = (variants: ProductVariantInput[] | undefined): ReturnType<typeof normalizeVariant>[] => {
  if (!variants || variants.length === 0) {
    return [];
  }
  return variants.map(normalizeVariant);
};

