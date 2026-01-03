import Setting from "../models/Setting.js";

// Get all settings or specific key
export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find({});
        const config = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update or Create a setting
export const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ message: "Key and Value are required" });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true } // Create if not exists
        );

        res.json({ success: true, setting });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
