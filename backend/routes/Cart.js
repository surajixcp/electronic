import express from "express";
import {
    addToCart,
    updateQuantity,
    removeFromCart,
    getCart,
    clearCart
} from "../controllers/Cart.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, addToCart);
router.put("/", protect, updateQuantity);
router.get("/", protect, getCart);
router.delete("/item/:productId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

export default router;
