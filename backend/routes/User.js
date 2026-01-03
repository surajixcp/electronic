import express from "express";
import multer from "multer";
import { register, login, sendForgotPasswordOTP, verifyOTP, resetPassword, uploadProfileImage } from "../controllers/User.js";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/Role.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post("/register", register);
router.get(
    "/admin",
    protect,
    authorize("Admin"),
    (req, res) => {
        res.json({ message: "Admin access granted" });
    }
);
// ... existing routes
router.post("/login", login);
router.post("/send-forgot-password-otp", sendForgotPasswordOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

router.post("/profile-image", protect, upload.single("avatar"), uploadProfileImage);

export default router;
