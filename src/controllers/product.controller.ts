import { Response, Request } from "express";
import { CreateProductRequestBody } from "../types/types";
import {
  createProduct as createProductService,
  getProducts as getProductsService,
  getProductById as getProductByIdService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  ProductFilters,
} from "../services/product.service";

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

    const product = await createProductService({
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
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode =
      errorMessage.includes("already exists") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("Invalid")
        ? errorMessage.includes("already exists")
          ? 409
          : errorMessage.includes("not found")
          ? 404
          : 400
        : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId, search, minPrice, maxPrice, brand, limit, page } =
      req.query;

    const filters: ProductFilters = {
      categoryId: categoryId as string,
      search: search as string,
      minPrice: minPrice as string | number,
      maxPrice: maxPrice as string | number,
      brand: brand as string,
      limit: limit as string | number,
      page: page as string | number,
    };

    const result = await getProductsService(filters);

    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = errorMessage.includes("Invalid") ? 400 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await getProductByIdService(id);

    res.json({ product });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode =
      errorMessage.includes("Invalid") || errorMessage.includes("not found")
        ? errorMessage.includes("not found")
          ? 404
          : 400
        : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const updateProduct = async (
  req: TypedRequest<Partial<CreateProductRequestBody>>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await updateProductService(id, updateData);

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode =
      errorMessage.includes("already exists") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("Invalid")
        ? errorMessage.includes("already exists")
          ? 409
          : errorMessage.includes("not found")
          ? 404
          : 400
        : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await deleteProductService(id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode =
      errorMessage.includes("Invalid") || errorMessage.includes("not found")
        ? errorMessage.includes("not found")
          ? 404
          : 400
        : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};
