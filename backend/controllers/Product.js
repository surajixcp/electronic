import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
    try {
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/products/${file.filename}`);
        } else if (req.body.images) {
            images = req.body.images; // Allow array of URLs
        } else {
            // Optional: validation if needed, or allow no images
            // return res.status(400).json({ error: "Product images are required" });
            // For now, let's allow it or use placeholder
            images = ["https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800"];
        }

        const product = await Product.create({
            ...req.body,
            images,
            createdBy: req.user._id
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

export const addProductReview = async (req, res) => {
    try {
        const { rating, comment, userName, userAvatar } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const review = {
                user: req.user._id,
                userName: userName || req.user.fullname,
                userAvatar,
                rating: Number(rating),
                comment,
            };

            product.reviews.push(review);
            product.reviewCount = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isAvailable: true });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(
                file => `/uploads/products/${file.filename}`
            );
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ error: "Product not found (Invalid ID)" });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
