import mongoose, { FilterQuery } from "mongoose";
import { Category } from "../models/Category.model";
import { Product } from "../models/Product.model";
import { CreateProductRequestBody, ProductResponse } from "../types/types";
import { validateVariants } from "../validators/product.validator";
import { normalizeVariants } from "../utils/product.utils";

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  brand?: string;
  page?: string | number;
  limit?: string | number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProductsResult {
  products: ProductResponse[];
  pagination: PaginationInfo;
}

const mapProductToResponse = (
  product: InstanceType<typeof Product>
): ProductResponse => {
  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    description: product.description || undefined,
    images: product.images || [],
    price: product.price,
    category: product.category
      ? typeof product.category === "object" && product.category !== null
        ? String(
            (product.category as { _id?: mongoose.Types.ObjectId })._id ||
              product.category
          )
        : String(product.category)
      : null,
    brand: product.brand || undefined,
    variants: (product.variants || []).map((v) => ({
      _id: v._id ? String(v._id) : undefined,
      size: v.size || undefined,
      color: v.color || undefined,
      name: v.name || undefined,
      stock: v.stock,
      price: v.price || undefined,
      available: v.available,
    })),
    ratingsAverage: product.ratingsAverage || undefined,
    ratingsCount: product.ratingsCount || undefined,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const createProduct = async (
  productData: CreateProductRequestBody
): Promise<ProductResponse> => {
  const {
    name,
    slug,
    description,
    images,
    price,
    categoryId,
    brand,
    ratingsAverage,
    ratingsCount,
    variants,
  } = productData;

  if (variants !== undefined) {
    const variantsValidation = validateVariants(variants);
    if (!variantsValidation.isValid) {
      throw new Error(variantsValidation.error);
    }
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  const existingProduct = await Product.findOne({
    slug: slug.trim().toLowerCase(),
  });
  if (existingProduct) {
    throw new Error("Product with this slug already exists");
  }

  const product = new Product({
    name: name.trim(),
    slug: slug.trim().toLowerCase(),
    description: description?.trim(),
    images: images || [],
    price,
    category: new mongoose.Types.ObjectId(categoryId),
    brand: brand?.trim(),
    variants: normalizeVariants(variants),
    ratingsAverage: ratingsAverage || 0,
    ratingsCount: ratingsCount || 0,
  });

  await product.save();

  return mapProductToResponse(product);
};

export const getProducts = async (
  filters: ProductFilters
): Promise<ProductsResult> => {
  const { categoryId, search, minPrice, maxPrice, brand, limit, page } =
    filters;

  const query: FilterQuery<typeof Product> = {};

  if (categoryId) {
    const categoryIdStr = String(categoryId).trim();
    if (!mongoose.Types.ObjectId.isValid(categoryIdStr)) {
      throw new Error("Invalid category ID");
    }
    query.category = new mongoose.Types.ObjectId(categoryIdStr);
  }

  if (brand) {
    query.brand = { $regex: brand, $options: "i" };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const pageNumber = parseInt(String(page)) || 1;
  const pageSize = parseInt(String(limit)) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  const total = await Product.countDocuments(query);

  const productsResponse: ProductResponse[] =
    products.map(mapProductToResponse);

  return {
    products: productsResponse,
    pagination: {
      page: pageNumber,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getProductById = async (id: string): Promise<ProductResponse> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id).populate("category", "name slug");

  if (!product) {
    throw new Error("Product not found");
  }

  return mapProductToResponse(product);
};

export const updateProduct = async (
  id: string,
  updateData: Partial<CreateProductRequestBody>
): Promise<ProductResponse> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  if (updateData.variants !== undefined) {
    const variantsValidation = validateVariants(updateData.variants);
    if (!variantsValidation.isValid) {
      throw new Error(variantsValidation.error);
    }
  }

  if (updateData.categoryId) {
    if (!mongoose.Types.ObjectId.isValid(updateData.categoryId)) {
      throw new Error("Invalid category ID");
    }
    const category = await Category.findById(updateData.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
  }

  if (updateData.slug && updateData.slug !== product.slug) {
    const existingProduct = await Product.findOne({
      slug: updateData.slug.trim().toLowerCase(),
    });
    if (existingProduct) {
      throw new Error("Product with this slug already exists");
    }
  }

  if (updateData.name) product.name = updateData.name.trim();
  if (updateData.slug) product.slug = updateData.slug.trim().toLowerCase();
  if (updateData.description !== undefined)
    product.description = updateData.description?.trim();
  if (updateData.images !== undefined) product.images = updateData.images;
  if (updateData.price !== undefined) product.price = updateData.price;
  if (updateData.categoryId)
    product.category = new mongoose.Types.ObjectId(updateData.categoryId);
  if (updateData.brand !== undefined) product.brand = updateData.brand?.trim();
  if (updateData.ratingsAverage !== undefined)
    product.ratingsAverage = updateData.ratingsAverage;
  if (updateData.ratingsCount !== undefined)
    product.ratingsCount = updateData.ratingsCount;

  if (updateData.variants !== undefined) {
    product.variants = normalizeVariants(
      updateData.variants
    ) as unknown as typeof product.variants;
  }

  await product.save();
  await product.populate("category", "name slug");

  return mapProductToResponse(product);
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new Error("Product not found");
  }
};
