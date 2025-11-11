import { Response, Request } from "express";
import { CreateCategoryRequestBody } from "../types/types";
import {
  createCategory as createCategoryService,
  getCategories as getCategoriesService,
  getCategoryById as getCategoryByIdService,
} from "../services/category.service";

interface TypedRequest<T> extends Request {
  body: T;
}

export const createCategory = async (
  req: TypedRequest<CreateCategoryRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, slug, description, parentId } = req.body;

    if (!name || name.trim() === "") {
      res.status(400).json({ error: "Category name is required" });
      return;
    }

    if (!slug || slug.trim() === "") {
      res.status(400).json({ error: "Category slug is required" });
      return;
    }

    const category = await createCategoryService({
      name,
      slug,
      description,
      parentId,
    });

    res.status(201).json({
      message: parentId
        ? "Subcategory created successfully"
        : "Category created successfully",
      category,
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

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await getCategoriesService();

    res.json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: errorMessage });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await getCategoryByIdService(id);

    res.json({ category });
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
