import { ProductVariantInput } from "../types/types";

export const normalizeString = (
  value: string | undefined
): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
};

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

export const normalizeVariants = (
  variants: ProductVariantInput[] | undefined
): ReturnType<typeof normalizeVariant>[] => {
  if (!variants || variants.length === 0) {
    return [];
  }
  return variants.map(normalizeVariant);
};
