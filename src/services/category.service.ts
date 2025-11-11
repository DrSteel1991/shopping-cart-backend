import mongoose from "mongoose";
import { Category } from "../models/Category.model";
import { CreateCategoryRequestBody, CategoryResponse } from "../types/types";

const mapCategoryToResponse = (
  category: InstanceType<typeof Category>
): CategoryResponse => {
  return {
    id: String(category._id),
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
};

export const createCategory = async (
  categoryData: CreateCategoryRequestBody
): Promise<CategoryResponse> => {
  const { name, slug, description, parentId } = categoryData;

  const normalizedSlug = slug.trim().toLowerCase();

  const existingCategory = await Category.findOne({ slug: normalizedSlug });
  if (existingCategory) {
    throw new Error("Category with this slug already exists");
  }

  if (parentId) {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      throw new Error("Invalid parent category ID");
    }

    const parent = await Category.findById(parentId);
    if (!parent) {
      throw new Error("Parent category not found");
    }
  }

  const category = new Category({
    name: name.trim(),
    slug: normalizedSlug,
    description: description?.trim(),
    parent: parentId || null,
  });

  await category.save();

  await category.populate("parent", "name slug");

  return mapCategoryToResponse(category);
};

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const categories = await Category.find({})
    .populate("parent", "name slug")
    .sort({ name: 1 });

  return categories.map(mapCategoryToResponse);
};

export const getCategoryById = async (
  id: string
): Promise<CategoryResponse> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(id).populate("parent", "name slug");

  if (!category) {
    throw new Error("Category not found");
  }

  return mapCategoryToResponse(category);
};
