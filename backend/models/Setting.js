import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['upi_config'] // restrict keys if needed, but flexibility is good
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Setting", settingSchema);
