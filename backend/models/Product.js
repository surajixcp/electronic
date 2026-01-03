import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"]
        },

        stock: {
            type: Number,
            required: [true, "Product stock is required"],
            min: [0, "Stock cannot be negative"]
        },

        sold: {
            type: Number,
            default: 0
        },

        category: {
            type: String,
            required: [true, "Product category is required"],
            enum: ["Mobile", "Laptop", "TV", "Accessories", "Other", "Electronics", "Home Appliances"]
        },

        images: [
            {
                type: String,
                required: [true, "Product images are required"]
            }
        ],

        isAvailable: {
            type: Boolean,
            default: true
        },

        specs: {
            type: Map,
            of: String,
            default: {}
        },

        condition: {
            type: String,
            enum: ["New", "Refurbished", "Used"],
            default: "New"
        },

        discount: {
            type: Number,
            default: 0
        },

        originalPrice: {
            type: Number,
            default: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                userName: {
                    type: String,
                    required: true
                },
                userAvatar: {
                    type: String
                },
                rating: {
                    type: Number,
                    required: true
                },
                comment: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        rating: {
            type: Number,
            default: 0
        },
        reviewCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
