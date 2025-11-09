import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Get all products (public - with optional filters)
router.get("/", getProducts);

// Get product by ID (public)
router.get("/:id", getProductById);

// Create product (protected - requires authentication)
router.post("/", authenticate, createProduct);

// Update product (protected - requires authentication)
router.put("/:id", authenticate, updateProduct);
router.patch("/:id", authenticate, updateProduct);

// Delete product (protected - requires authentication)
router.delete("/:id", authenticate, deleteProduct);

export default router;
