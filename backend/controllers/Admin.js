import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        if (user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.fullname,
                email: user.email,
                mobile: user.phone,
                role: user.role,
                address: user.address,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ error: error.message });
    }
};
