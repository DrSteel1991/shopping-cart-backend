import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Create category (protected - requires authentication)
router.post("/", authenticate, createCategory);

// Get all categories (public)
router.get("/", getCategories);

// Get category by ID (public)
router.get("/:id", getCategoryById);

export default router;
