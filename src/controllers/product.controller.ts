import { Response, Request } from "express";
import { CreateProductRequestBody, ProductResponse } from "../types/types";
import mongoose, { FilterQuery } from "mongoose";
import { Category } from "../models/Category.model";
import { Product } from "../models/Product.model";
import { validateVariants } from "../validators/product.validator";
import { normalizeVariants } from "../utils/product.utils";

interface TypedRequest<T> extends Request {
  body: T;
}

export const createProduct = async (
  req: TypedRequest<CreateProductRequestBody>,
  res: Response
) => {
  try {
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
    } = req.body;

    if (!name || !slug || !price || !categoryId) {
      res
        .status(400)
        .json({ error: "Name, slug, price, and categoryId are required" });
      return;
    }

    // Validate variants (optional - products can have no variants)
    if (variants !== undefined) {
      const variantsValidation = validateVariants(variants);
      if (!variantsValidation.isValid) {
        res.status(400).json({ error: variantsValidation.error });
        return;
      }
    }

    let category = null;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Check if slug already exists
    const existingProduct = await Product.findOne({
      slug: slug.trim().toLowerCase(),
    });
    if (existingProduct) {
      res.status(409).json({ error: "Product with this slug already exists" });
      return;
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

    const response: ProductResponse = {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description || undefined,
      images: product.images || [],
      price: product.price,
      brand: product.brand || undefined,
      variants: (product.variants || []).map((v) => ({
        size: v.size || undefined,
        color: v.color || undefined,
        stock: v.stock,
        price: v.price || undefined,
        available: v.available,
      })),
      ratingsAverage: product.ratingsAverage || undefined,
      ratingsCount: product.ratingsCount || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    res.status(201).json({
      message: "Product created successfully",
      product: response,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId, search, minPrice, maxPrice, brand, limit, page } =
      req.query;

    // Build query
    const query: FilterQuery<typeof Product> = {};

    if (categoryId) {
      const categoryIdStr = String(categoryId).trim();
      if (!mongoose.Types.ObjectId.isValid(categoryIdStr)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }
      // Convert to ObjectId for proper MongoDB query matching
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

    // Pagination
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Product.countDocuments(query);

    const productsResponse: ProductResponse[] = products.map((product) => ({
      id: product._id.toString(),
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
        size: v.size || undefined,
        color: v.color || undefined,
        stock: v.stock,
        price: v.price || undefined,
        available: v.available,
      })),
      ratingsAverage: product.ratingsAverage || undefined,
      ratingsCount: product.ratingsCount || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    res.json({
      products: productsResponse,
      pagination: {
        page: pageNumber,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await Product.findById(id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const response: ProductResponse = {
      id: product._id.toString(),
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
        size: v.size || undefined,
        color: v.color || undefined,
        stock: v.stock,
        price: v.price || undefined,
        available: v.available,
      })),
      ratingsAverage: product.ratingsAverage || undefined,
      ratingsCount: product.ratingsCount || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    res.json({ product: response });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (
  req: TypedRequest<Partial<CreateProductRequestBody>>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Validate variants if provided
    if (updateData.variants !== undefined) {
      const variantsValidation = validateVariants(updateData.variants);
      if (!variantsValidation.isValid) {
        res.status(400).json({ error: variantsValidation.error });
        return;
      }
    }

    // Check category if categoryId is provided
    if (updateData.categoryId) {
      if (!mongoose.Types.ObjectId.isValid(updateData.categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
    }

    // Check slug uniqueness if slug is being updated
    if (updateData.slug && updateData.slug !== product.slug) {
      const existingProduct = await Product.findOne({
        slug: updateData.slug.trim().toLowerCase(),
      });
      if (existingProduct) {
        res
          .status(409)
          .json({ error: "Product with this slug already exists" });
        return;
      }
    }

    // Update fields
    if (updateData.name) product.name = updateData.name.trim();
    if (updateData.slug) product.slug = updateData.slug.trim().toLowerCase();
    if (updateData.description !== undefined)
      product.description = updateData.description?.trim();
    if (updateData.images !== undefined) product.images = updateData.images;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.categoryId)
      product.category = new mongoose.Types.ObjectId(updateData.categoryId);
    if (updateData.brand !== undefined)
      product.brand = updateData.brand?.trim();
    if (updateData.ratingsAverage !== undefined)
      product.ratingsAverage = updateData.ratingsAverage;
    if (updateData.ratingsCount !== undefined)
      product.ratingsCount = updateData.ratingsCount;

    // Update variants if provided
    if (updateData.variants !== undefined) {
      product.variants = normalizeVariants(
        updateData.variants
      ) as unknown as typeof product.variants;
    }

    await product.save();
    await product.populate("category", "name slug");

    const response: ProductResponse = {
      id: product._id.toString(),
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
        size: v.size || undefined,
        color: v.color || undefined,
        stock: v.stock,
        price: v.price || undefined,
        available: v.available,
      })),
      ratingsAverage: product.ratingsAverage || undefined,
      ratingsCount: product.ratingsCount || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    res.json({
      message: "Product updated successfully",
      product: response,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
