import express from "express";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  addProductReview
} from "../controllers/Product.js";

import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/Role.js";
import upload from "../middlewares/Multer.js";

const router = express.Router();

/* USER & ADMIN */
/* USER & ADMIN */
router.get("/", getProducts);
// ...
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, addProductReview);

/* ADMIN ONLY */
router.post(
  "/",
  protect,
  authorize("Admin"),
  upload.array("images", 5), // 👈 THIS LINE IS REQUIRED
  addProduct
);

router.put(
  "/:id",
  protect,
  authorize("Admin"),
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, authorize("Admin"), deleteProduct);

export default router;
