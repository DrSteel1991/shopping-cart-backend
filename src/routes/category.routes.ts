import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createCategory);

router.get("/", getCategories);

router.get("/:id", getCategoryById);

export default router;
