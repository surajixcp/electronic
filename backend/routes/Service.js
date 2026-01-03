import express from "express";
import {
    getServices,
    createService,
    updateService,
    deleteService
} from "../controllers/Service.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getServices);
router.post("/", protect, createService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

export default router;
