import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpStorage = {};

export const register = async (req, res) => {
  try {
    const { fullname, email, password, phone, role } = req.body;

    const userExist = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExist)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phone,
      role: role === "Admin" ? "Admin" : "User"
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });

    if (query.length === 0) {
      return res.status(400).json({ message: "Please provide email or phone" });
    }

    const user = await User.findOne({ $or: query });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

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
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password Logic 

export const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp;
    console.log(otp);
    console.log(otpStorage);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

// Verify OTP
export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!otpStorage[email] || otpStorage[email] !== otp) {
    return res.status(400).json({ error: "Invalid OTP or OTP expired!" });
  }

  res.json({ message: "OTP verified successfully!" });
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otpStorage[email] || otpStorage[email] !== otp) {
      return res.status(400).json({ error: "Invalid OTP!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    delete otpStorage[email]; // Clear OTP after successful reset

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password." });
  }
};

// Upload Profile Image

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "user_avatars",
      width: 150,
      crop: "scale"
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Update User
    // Assuming req.user.id is set by protect middleware
    // If protect middleware attaches user to req.user (standard)
    // We need to check how protect works. Usually it decodes token.
    // Let's assume req.user.id.

    // Check if req.user exists (protected route)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = result.secure_url;
    await user.save();

    res.json({ success: true, avatar: user.avatar });

  } catch (error) {
    console.error("Upload Error:", error);
    // Try to delete file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Image upload failed" });
  }
};
