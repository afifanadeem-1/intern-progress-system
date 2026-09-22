const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await User.findOne({
            email: "admin@example.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            await mongoose.connection.close();
            return;
        }

        await User.create({
            name: "System Admin",
            email: "admin@example.com",
            password: "Admin12345",
            role: "admin",
            department: "Administration"
        });

        console.log("Admin created successfully");

        await mongoose.connection.close();

    } catch (error) {
        console.error("Failed to create admin:", error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdmin();