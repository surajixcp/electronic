import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const adminEmail = "adminelectrofix@gmail.com";
        const adminPhone = "9876543210";
        const adminPassword = "password123";

        const existingAdmin = await User.findOne({ email: adminEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        if (existingAdmin) {
            console.log("Admin user already exists. Updating credentials...");
            existingAdmin.password = hashedPassword;
            existingAdmin.phone = adminPhone;
            existingAdmin.fullname = "ElectroFix Admin";
            existingAdmin.role = "Admin"; // Ensure role is Admin
            await existingAdmin.save();
            console.log("Admin user updated successfully");
        } else {
            const adminUser = new User({
                fullname: "ElectroFix Admin",
                email: adminEmail,
                password: hashedPassword,
                phone: adminPhone,
                role: "Admin"
            });

            await adminUser.save();
            console.log("Admin user created successfully");
        }

        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        mongoose.disconnect();
        process.exit();
    }
};

seedAdmin();
