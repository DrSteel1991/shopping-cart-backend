import { Document } from "mongoose";

export interface User extends Document {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address?: Address[];
  cart?: {
    productId: string;
    quantity: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Request body types
export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface RegisterRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  phone: string;
  address?: Address[];
}

export interface RegisterResponse {
  id?: string;
  message?: string;
  token?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
    address: Address[];
    cart?: {
      productId: string;
      quantity: number;
    }[];
  };
  error?: string;
}

// Category types
export interface Category extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequestBody {
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // For subcategories
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Input variant type - size and color are strings
export interface ProductVariantInput {
  size?: string;
  color?: string;
  name?: string;
  stock: number;
  price?: number;
  available?: boolean;
  sku?: string;
}

// Output variant type - size and color are strings
export interface ProductVariant {
  _id?: string; // Variant ID (Mongoose subdocument ID)
  size?: string; // Size (e.g., "256GB" or "Small")
  color?: string; // Color (e.g., "black" or "red")
  name?: string; // Optional variant name/label for display
  stock: number;
  price?: number; // Optional price override
  available: boolean;
  sku?: string; // Optional SKU for this variant
}

export interface Product extends Document {
  name: string;
  description?: string;
  images?: string[];
  price: number;
  category: string;
  brand?: string;
  variants: ProductVariant[]; // Variants with arrays of sizes and colors
  ratingsAverage?: number;
  ratingsCount?: number;
  createdAt: Date;
  updatedAt: Date;
  isVariantAvailable(
    options: {
      size?: string;
      color?: string;
      sku?: string;
      variantId?: string;
    },
    quantity?: number
  ): boolean;
  getVariant(options: {
    size?: string;
    color?: string;
    sku?: string;
    variantId?: string;
  }): ProductVariant | undefined;
}

export interface CreateProductRequestBody {
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  price: number;
  categoryId: string;
  brand?: string;
  ratingsAverage?: number;
  ratingsCount?: number;
  variants?: ProductVariantInput[]; // Variants with size and color as strings
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  price: number;
  category?: string | null;
  brand?: string;
  variants: ProductVariant[];
  ratingsAverage?: number;
  ratingsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
