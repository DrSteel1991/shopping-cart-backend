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

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", authenticate, createProduct);

router.put("/:id", authenticate, updateProduct);
router.patch("/:id", authenticate, updateProduct);

router.delete("/:id", authenticate, deleteProduct);

export default router;
