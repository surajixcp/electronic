import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const users = await User.find({});
        console.log("Found users:", users.length);
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.fullname}, Email: '${u.email}', Role: ${u.role}, PwdHash: ${u.password.substring(0, 10)}...`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

debugUsers();
