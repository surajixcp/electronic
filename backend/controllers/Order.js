import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod, serviceId, productId, items: directItems } = req.body;

        let items = [];
        let totalAmount = 0;

        // CASE 1: Service Booking
        if (serviceId) {
            const Service = (await import("../models/Service.js")).default;
            const service = await Service.findById(serviceId);
            if (!service) return res.status(404).json({ message: "Service not found" });

            items.push({
                service: service._id,
                name: service.title,
                price: service.basePrice,
                quantity: 1,
                itemTotal: service.basePrice
            });
            totalAmount = service.basePrice;

        }
        // CASE 2: Direct Product Order (Single Item)
        else if (productId) {
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: "Product not found" });

            if (product.stock < 1) return res.status(400).json({ message: "Out of stock" });

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                itemTotal: product.price
            });
            totalAmount = product.price;

            // Update stock
            product.stock -= 1;
            product.sold += 1;
            await product.save();

        }
        // CASE 3: Direct Cart Items (from Frontend Payload)
        else if (directItems && directItems.length > 0) {
            for (const item of directItems) {
                const product = await Product.findById(item.productId);
                if (!product) continue; // Skip invalid

                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                }

                items.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    itemTotal: product.price * item.quantity
                });
                totalAmount += product.price * item.quantity;

                // Update stock
                product.stock -= item.quantity;
                product.sold += item.quantity;
                await product.save();
            }
        }
        // CASE 4: Fallback to Backend Database Cart
        else {
            const cart = await Cart.findOne({ user: userId }).populate("items.product");
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ message: "No items to order" });
            }

            for (const item of cart.items) {
                const product = item.product;
                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                }

                product.stock -= item.quantity;
                product.sold += item.quantity;
                await product.save();

                items.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    itemTotal: product.price * item.quantity
                });
                totalAmount += product.price * item.quantity;
            }
            // Clear cart ONLY if we used it
            cart.items = [];
            await cart.save();
        }

        const order = await Order.create({
            user: userId,
            items,
            shippingAddress, // Ensure Frontend sends this structure matching schema
            totalAmount,
            paymentMethod: paymentMethod || 'COD',
            paymentScreenshot: req.body.paymentScreenshot
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate("items.product")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.product");

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ message: "Order not found" });

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: "Order status updated",
            order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        if (order.status === "Delivered") {
            return res.status(400).json({
                message: "Delivered order cannot be cancelled"
            });
        }

        order.status = "Cancelled";
        await order.save();

        res.json({
            success: true,
            message: "Order cancelled successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        await order.deleteOne();

        res.json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "id name email").sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const uploadPaymentScreenshot = async (req, res) => {
    try {
        const { screenshotUrl } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.paymentScreenshot = screenshotUrl;
        await order.save();

        res.json({ success: true, message: "Payment screenshot updated", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.isPaymentVerified = true;
        // Optionally update status to Confirmed if it was Pending
        if (order.status === 'Pending') {
            order.status = 'Confirmed';
        }
        await order.save();

        res.json({ success: true, message: "Payment verified", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const uploadInvoice = async (req, res) => {
    try {
        const { invoiceUrl } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.invoiceUrl = invoiceUrl;
        await order.save();

        res.json({ success: true, message: "Invoice uploaded", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
