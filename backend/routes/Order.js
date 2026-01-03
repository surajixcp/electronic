import express from "express";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    deleteOrder,
    uploadPaymentScreenshot,
    verifyPayment,
    uploadInvoice
} from "../controllers/Order.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", protect, getAllOrders);
router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);
router.delete("/:id", protect, deleteOrder);
router.put("/:id/payment-screenshot", protect, uploadPaymentScreenshot);
router.put("/:id/verify-payment", protect, verifyPayment);
router.put("/:id/invoice", protect, uploadInvoice);

export default router;
