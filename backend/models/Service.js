import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Service title is required"],
            trim: true
        },
        category: {
            type: String,
            default: "General"
        },
        basePrice: {
            type: Number,
            required: [true, "Base price is required"],
            min: [0, "Price cannot be negative"]
        },
        description: {
            type: String,
            default: ""
        },
        brand: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
