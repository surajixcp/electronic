import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/User.js";
import productRoutes from "./routes/Product.js";
import cartRoutes from "./routes/Cart.js";
import orderRoutes from "./routes/Order.js";
import serviceRoutes from "./routes/Service.js";
import adminRoutes from "./routes/Admin.js";
import uploadRoutes from "./routes/Upload.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", (await import("./routes/Setting.js")).default);

app.get("/", (req, res) => {
  res.send("E-Commerce Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
