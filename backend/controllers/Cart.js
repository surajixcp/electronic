import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

/* ================= ADD TO CART ================= */
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        console.log(product);
        if (!product || !product.isAvailable || product.stock < quantity) {
            return res.status(400).json({ message: "Product not available" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [{ product: productId, quantity }]
            });
        } else {
            const index = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (index > -1) {
                cart.items[index].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            await cart.save();
        }

        res.json({ success: true, message: "Added to cart" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ================= UPDATE QUANTITY ================= */
export const updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) return res.status(404).json({ message: "Item not in cart" });

        if (quantity <= 0) {
            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        res.json({ success: true, message: "Cart updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ================= REMOVE ITEM ================= */
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        res.json({ success: true, message: "Item removed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ================= GET CART ================= */
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate("items.product", "name price");

        if (!cart) {
            return res.json({ items: [], cartTotal: 0 });
        }

        let cartTotal = 0;

        const items = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            cartTotal += itemTotal;

            return {
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                itemTotal
            };
        });

        res.json({ items, cartTotal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
