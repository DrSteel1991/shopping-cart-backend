import { Response, Request } from "express";
import { Category } from "../models/Category.model";
import { CreateCategoryRequestBody, CategoryResponse } from "../types/types";
import mongoose from "mongoose";

// Typed Request interface
interface TypedRequest<T> extends Request {
  body: T;
}

export const createCategory = async (
  req: TypedRequest<CreateCategoryRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, slug, description, parentId } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      res.status(400).json({ error: "Category name is required" });
      return;
    }

    if (!slug || slug.trim() === "") {
      res.status(400).json({ error: "Category slug is required" });
      return;
    }

    // Normalize slug (trim and lowercase)
    const normalizedSlug = slug.trim().toLowerCase();

    // Check if category with same slug already exists
    const existingCategory = await Category.findOne({ slug: normalizedSlug });
    if (existingCategory) {
      res.status(409).json({ error: "Category with this slug already exists" });
      return;
    }

    // If parentId is provided, validate it exists
    let parent = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        res.status(400).json({ error: "Invalid parent category ID" });
        return;
      }

      parent = await Category.findById(parentId);
      if (!parent) {
        res.status(404).json({ error: "Parent category not found" });
        return;
      }
    }

    // Create category
    const category = new Category({
      name: name.trim(),
      slug: normalizedSlug,
      description: description?.trim(),
      parent: parentId || null,
    });

    await category.save();

    // Populate parent if it exists
    await category.populate("parent", "name slug");

    const response: CategoryResponse = {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug || "",
      description: category.description || undefined,
      parent: category.parent
        ? typeof category.parent === "object" && category.parent !== null
          ? String(
              (category.parent as { _id?: mongoose.Types.ObjectId })._id ||
                category.parent
            )
          : String(category.parent)
        : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    res.status(201).json({
      message: parentId
        ? "Subcategory created successfully"
        : "Category created successfully",
      category: response,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Return all categories without filtering
    const categories = await Category.find({})
      .populate("parent", "name slug")
      .sort({ name: 1 });

    const categoriesResponse: CategoryResponse[] = categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug || "",
      description: cat.description || undefined,
      parent: cat.parent
        ? typeof cat.parent === "object" && cat.parent !== null
          ? String(
              (cat.parent as { _id?: mongoose.Types.ObjectId })._id ||
                cat.parent
            )
          : String(cat.parent)
        : null,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    res.json({
      count: categoriesResponse.length,
      categories: categoriesResponse,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const category = await Category.findById(id).populate(
      "parent",
      "name slug"
    );

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const response: CategoryResponse = {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug || "",
      description: category.description || undefined,
      parent: category.parent
        ? typeof category.parent === "object" && category.parent !== null
          ? String(
              (category.parent as { _id?: mongoose.Types.ObjectId })._id ||
                category.parent
            )
          : String(category.parent)
        : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    res.json({ category: response });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
