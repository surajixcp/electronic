import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        itemTotal: { type: Number, required: true }
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: {
            type: String,
            required: true,
            match: [/^[1-9][0-9]{5}$/, "Invalid pincode"]
        },
        country: { type: String, default: "India" }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: { type: [orderItemSchema], required: true },
        shippingAddress: { type: addressSchema, required: true },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Delivered", "Cancelled", "Shipped"],
            default: "Pending"
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD"
        },
        isPaid: { type: Boolean, default: false },
        paymentScreenshot: { type: String, default: null },
        isPaymentVerified: { type: Boolean, default: false },
        invoiceUrl: { type: String, default: null }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
