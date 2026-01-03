import express from "express";
import { getSettings, updateSetting } from "../controllers/Setting.js";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/Role.js";

const router = express.Router();

router.get("/", getSettings); // Public read? Or protected? UPI ID is public if displayed on website.
router.put("/", protect, authorize("Admin"), updateSetting); // Only Admin updates

export default router;
