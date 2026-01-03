import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },

  avatar: {
    type: String,
    default: ""
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address",
    ],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    match: [
      /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
      "Password must contain at least one letter and one number",
    ],
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [
      /^[6-9]\d{9}$/,
      "Phone number must be a valid 10-digit Indian number",
    ],
  },

  address: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    default: "User",
    enum: ["User", "Admin"]
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
