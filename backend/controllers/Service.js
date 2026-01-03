import Service from "../models/Service.js";

// @desc    Get all services
// @route   GET /api/service
// @access  Public
export const getServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Create a new service
// @route   POST /api/service
// @access  Private (Admin)
export const createService = async (req, res) => {
    const { title, category, basePrice, description, brand, image } = req.body;

    if (!title || !basePrice) {
        return res.status(400).json({ message: "Title and Base Price are required" });
    }

    try {
        const service = new Service({
            title,
            category,
            basePrice,
            description,
            brand,
            image
        });

        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/service/:id
// @access  Private (Admin)
export const updateService = async (req, res) => {
    const { title, category, basePrice, description, brand, image } = req.body;

    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            service.title = title || service.title;
            service.category = category || service.category;
            service.basePrice = basePrice || service.basePrice;
            service.description = description || service.description;
            service.brand = brand || service.brand;
            service.image = image || service.image;

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: "Service not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/service/:id
// @access  Private (Admin)
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            await service.deleteOne();
            res.json({ message: "Service removed" });
        } else {
            res.status(404).json({ message: "Service not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
